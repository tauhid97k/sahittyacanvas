<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Permission;
use App\Enums\Role;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Enums\TransactionStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\NewOrderForSeller;
use App\Notifications\OrderPlaced;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display buyer's orders.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_ORDER->value)) {
            abort(403);
        }

        $user = $request->user();

        $orders = Order::query()
            ->select([
                'id', 'order_number', 'seller_id', 'subtotal', 'shipping_cost', 'total',
                'status', 'payment_status', 'payment_method', 'created_at'
            ])
            ->with(['seller:id,name', 'items:id,order_id,product_name,quantity,unit_price,total'])
            ->where('user_id', $user->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform with computed attributes
        $orders->through(function ($order) {
            $order->subtotal_in_taka = $order->subtotal_in_taka;
            $order->total_in_taka = $order->total_in_taka;
            $order->formatted_total = $order->formatted_total;
            $order->status_label = $order->status_label;
            $order->payment_status_label = $order->payment_status_label;
            return $order;
        });

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => [
                'status' => $request->get('status', ''),
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Display seller's orders (dashboard).
     */
    public function sellerIndex(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_ORDER->value)) {
            abort(403);
        }

        $user = $request->user();
        $scope = $request->get('scope', 'all');
        
        // Check if user can view all seller orders (Super Admin / Admin)
        $canViewAll = $user->hasRole([Role::SUPER->value, Role::ADMIN->value]);

        $orders = Order::query()
            ->select([
                'id', 'order_number', 'user_id', 'subtotal', 'shipping_cost', 'total',
                'status', 'payment_status', 'payment_method', 'shipping_name', 'shipping_phone',
                'shipping_city', 'tracking_number', 'created_at'
            ])
            ->with(['buyer:id,name,email', 'items:id,order_id,product_id,product_name,quantity,unit_price,total'])
            // Ownership filtering: Regular sellers see only their orders, Super Admin sees all or filter
            ->when(!$canViewAll || $scope === 'mine', function ($query) use ($user) {
                $query->where('seller_id', $user->id);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('shipping_name', 'like', "%{$search}%")
                      ->orWhere('shipping_phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->when($request->filled('payment'), function ($query) use ($request) {
                $query->where('payment_status', $request->get('payment'));
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform with computed attributes
        $orders->through(function ($order) {
            $order->subtotal_in_taka = $order->subtotal_in_taka;
            $order->shipping_cost_in_taka = $order->shipping_cost_in_taka;
            $order->total_in_taka = $order->total_in_taka;
            $order->formatted_total = $order->formatted_total;
            $order->status_label = $order->status_label;
            $order->payment_status_label = $order->payment_status_label;
            $order->total_items = $order->total_items;
            return $order;
        });

        // Get counts for tabs
        $baseQuery = $canViewAll && $scope !== 'mine'
            ? Order::query()
            : Order::where('seller_id', $user->id);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->pending()->count(),
            'confirmed' => (clone $baseQuery)->confirmed()->count(),
            'processing' => (clone $baseQuery)->processing()->count(),
            'shipped' => (clone $baseQuery)->shipped()->count(),
            'delivered' => (clone $baseQuery)->delivered()->count(),
            'cancelled' => (clone $baseQuery)->cancelled()->count(),
        ];

        return Inertia::render('dashboard/orders/index', [
            'orders' => $orders,
            'counts' => $counts,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'payment' => $request->get('payment', ''),
                'scope' => $scope,
            ],
            'canViewAll' => $canViewAll,
            'statuses' => collect(OrderStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
            'paymentStatuses' => collect(PaymentStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Display order details for seller.
     */
    public function show(Request $request, Order $order): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::VIEW_ORDER->value)) {
            abort(403);
        }

        // Ensure user is the seller (admin/super can view all)
        $canViewAll = $request->user()->hasRole(Role::SUPER->value) || $request->user()->hasRole(Role::ADMIN->value);
        if (!$canViewAll && $order->seller_id !== $request->user()->id) {
            abort(403);
        }

        $order->load([
            'buyer:id,name,email',
            'items.product:id,slug,name_bn',
            'items.product.media',
        ]);

        // Add computed attributes
        $order->subtotal_in_taka = $order->subtotal_in_taka;
        $order->shipping_cost_in_taka = $order->shipping_cost_in_taka;
        $order->total_in_taka = $order->total_in_taka;
        $order->formatted_subtotal = $order->formatted_subtotal;
        $order->formatted_shipping_cost = $order->formatted_shipping_cost;
        $order->formatted_total = $order->formatted_total;
        $order->status_label = $order->status_label;
        $order->payment_status_label = $order->payment_status_label;

        // Transform items
        $order->items->transform(function ($item) {
            $item->unit_price_in_taka = $item->unit_price_in_taka;
            $item->total_in_taka = $item->total_in_taka;
            $item->formatted_unit_price = $item->formatted_unit_price;
            $item->formatted_total = $item->formatted_total;
            if ($item->product) {
                $item->product->featured_image_url = $item->product->featured_image_url;
            }
            return $item;
        });

        return Inertia::render('dashboard/orders/show', [
            'order' => $order,
            'statuses' => collect(OrderStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    /**
     * Display buyer's order details.
     */
    public function buyerShow(Request $request, Order $order): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::VIEW_ORDER->value)) {
            abort(403);
        }

        // Ensure user is the buyer
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $order->load([
            'seller:id,name',
            'items.product:id,slug,name_bn',
            'items.product.media',
        ]);

        // Add computed attributes
        $order->subtotal_in_taka = $order->subtotal_in_taka;
        $order->shipping_cost_in_taka = $order->shipping_cost_in_taka;
        $order->total_in_taka = $order->total_in_taka;
        $order->formatted_subtotal = $order->formatted_subtotal;
        $order->formatted_shipping_cost = $order->formatted_shipping_cost;
        $order->formatted_total = $order->formatted_total;
        $order->status_label = $order->status_label;
        $order->payment_status_label = $order->payment_status_label;

        // Transform items
        $order->items->transform(function ($item) {
            $item->unit_price_in_taka = $item->unit_price_in_taka;
            $item->total_in_taka = $item->total_in_taka;
            $item->formatted_unit_price = $item->formatted_unit_price;
            $item->formatted_total = $item->formatted_total;
            if ($item->product) {
                $item->product->featured_image_url = $item->product->featured_image_url;
            }
            return $item;
        });

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Show checkout page.
     */
    public function showCheckout(Request $request): Response
    {
        $cart = $this->getCart($request);

        if (!$cart || $cart->isEmpty()) {
            return Inertia::render('checkout/index', [
                'cart' => [
                    'items' => [],
                    'grouped' => [],
                    'subtotal' => 0,
                    'formatted_subtotal' => '৳0',
                ],
                'user' => $request->user(),
            ]);
        }

        $cart->load(['items.product.user', 'items.product.media']);

        $items = $cart->items->map(fn ($item) => [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
            'unit_price' => $item->unit_price,
            'total' => $item->total,
            'product' => $item->product ? [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'image' => $item->product->getFirstMediaUrl('images', 'thumb') ?: null,
                'stock' => $item->product->stock_count,
                'seller' => $item->product->user ? [
                    'id' => $item->product->user->id,
                    'name' => $item->product->user->name,
                    'username' => $item->product->user->username,
                ] : null,
            ] : null,
        ])->filter(fn ($item) => $item['product'] !== null);

        // Group by seller
        $grouped = $items->groupBy('product.seller.id')->map(function ($sellerItems) {
            $seller = $sellerItems->first()['product']['seller'] ?? null;
            return [
                'seller' => $seller,
                'items' => $sellerItems->values()->toArray(),
                'subtotal' => $sellerItems->sum('total'),
            ];
        })->values()->toArray();

        return Inertia::render('checkout/index', [
            'cart' => [
                'items' => $items->values()->toArray(),
                'grouped' => $grouped,
                'subtotal' => $cart->subtotal,
                'formatted_subtotal' => $cart->formatted_subtotal,
            ],
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ] : null,
        ]);
    }

    /**
     * Checkout - create orders from cart.
     */
    public function checkout(CheckoutRequest $request): RedirectResponse
    {
        // Handle guest registration if not authenticated
        $guestData = null;
        if (!$request->user()) {
            $request->validate([
                'email' => ['required', 'email', 'max:255'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ], [
                'email.required' => 'ইমেইল আবশ্যক।',
                'email.email' => 'সঠিক ইমেইল দিন।',
                'password.required' => 'পাসওয়ার্ড আবশ্যক।',
                'password.min' => 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
                'password.confirmed' => 'পাসওয়ার্ড মিলছে না।',
            ]);
            $guestData = $request->only(['email', 'password']);
        }

        $validated = $request->validated();

        $user = $request->user();
        $cart = $this->getCart($request);

        if (!$cart || $cart->isEmpty()) {
            return back()->with('error', 'আপনার কার্ট খালি।');
        }

        // Load cart items with products
        $cart->load(['items.product.user']);

        // Validate all products are still available
        foreach ($cart->items as $item) {
            if (!$item->product || !$item->product->isVisible()) {
                $productName = $item->product?->name_bn ?? 'Unknown';
                return back()->with('error', "পণ্য '{$productName}' আর উপলব্ধ নয়।");
            }
            if ($item->quantity > $item->product->stock_count) {
                return back()->with('error', "পণ্য '{$item->product->name_bn}' এর স্টকে শুধুমাত্র {$item->product->stock_count}টি আছে।");
            }
        }

        // Group items by seller
        $itemsBySeller = $cart->items->groupBy('product.user_id');

        DB::beginTransaction();

        try {
            // Handle guest registration
            if (!$user && $guestData) {
                // Check if email already exists
                $existingUser = \App\Models\User::where('email', $guestData['email'])->first();
                if ($existingUser) {
                    return back()->with('error', 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে। অনুগ্রহ করে লগইন করুন।');
                }

                // Create new user (username will be auto-generated by boot method)
                $user = \App\Models\User::create([
                    'name' => $validated['shipping_name'],
                    'email' => $guestData['email'],
                    'password' => bcrypt($guestData['password']),
                ]);

                // Transfer guest cart to new user
                $cart->update(['user_id' => $user->id, 'session_id' => null]);

                // Log in the new user
                \Illuminate\Support\Facades\Auth::login($user);
            }

            $orderNumbers = [];

            foreach ($itemsBySeller as $sellerId => $items) {
                // Calculate totals for this seller's items using cart snapshot prices
                $subtotal = $items->sum(fn($item) => $item->quantity * $item->unit_price);
                $shippingCost = 0; // Can be calculated based on location/weight
                $total = $subtotal + $shippingCost;

                // Create order
                $order = Order::create([
                    'user_id' => $user->id,
                    'seller_id' => $sellerId,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'total' => $total,
                    'status' => OrderStatus::PENDING,
                    'payment_status' => PaymentStatus::UNPAID,
                    'payment_method' => $validated['payment_method'],
                    'shipping_name' => $validated['shipping_name'],
                    'shipping_phone' => $validated['shipping_phone'],
                    'shipping_email' => $validated['shipping_email'] ?? null,
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_city' => $validated['shipping_city'],
                    'shipping_area' => $validated['shipping_area'] ?? null,
                    'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                    'buyer_notes' => $validated['buyer_notes'] ?? null,
                ]);

                // Create order items and decrement stock
                foreach ($items as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $cartItem->product_id,
                        'product_name' => $cartItem->product->name_bn,
                        'product_sku' => $cartItem->product->sku,
                        'quantity' => $cartItem->quantity,
                        'unit_price' => $cartItem->unit_price,
                        'total' => $cartItem->quantity * $cartItem->unit_price,
                    ]);

                    // Decrement stock
                    $cartItem->product->decrementStock($cartItem->quantity);
                }

                // Get payment method
                $paymentMethod = PaymentMethod::where('slug', $validated['payment_method'])->first();

                // Create transaction for this order
                Transaction::create([
                    'transactionable_type' => Order::class,
                    'transactionable_id' => $order->id,
                    'payer_id' => $user->id,
                    'payee_id' => $sellerId,
                    'payment_method_id' => $paymentMethod?->id,
                    'amount' => $total,
                    'currency' => 'BDT',
                    'status' => TransactionStatus::PENDING,
                ]);

                $orderNumbers[] = $order->order_number;

                // Notify the buyer
                $user->notify(new OrderPlaced($order));

                // Notify the seller
                $seller = User::find($sellerId);
                if ($seller) {
                    $seller->notify(new NewOrderForSeller($order));
                }
            }

            // Clear cart
            $cart->clear();

            DB::commit();

            $message = count($orderNumbers) === 1
                ? "অর্ডার #{$orderNumbers[0]} সফলভাবে সম্পন্ন হয়েছে।"
                : count($orderNumbers) . "টি অর্ডার সফলভাবে সম্পন্ন হয়েছে।";

            return redirect()
                ->route('orders.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            return back()->with('error', 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
    }

    /**
     * Update order status (seller action).
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::UPDATE_ORDER_STATUS->value)) {
            abort(403);
        }

        // Ensure user is the seller
        if ($order->seller_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validated();
        $newStatus = OrderStatus::from($validated['status']);

        // Validate status transition
        $validTransition = match ($order->status) {
            OrderStatus::PENDING => in_array($newStatus, [OrderStatus::CONFIRMED, OrderStatus::CANCELLED]),
            OrderStatus::CONFIRMED => in_array($newStatus, [OrderStatus::PROCESSING, OrderStatus::CANCELLED]),
            OrderStatus::PROCESSING => $newStatus === OrderStatus::SHIPPED,
            OrderStatus::SHIPPED => $newStatus === OrderStatus::DELIVERED,
            default => false,
        };

        if (!$validTransition) {
            return back()->with('error', 'এই স্ট্যাটাস পরিবর্তন অনুমোদিত নয়।');
        }

        // Handle specific status updates
        match ($newStatus) {
            OrderStatus::CONFIRMED => $order->confirm(),
            OrderStatus::PROCESSING => $order->markAsProcessing(),
            OrderStatus::SHIPPED => $order->markAsShipped(
                $validated['tracking_number'] ?? null,
                $validated['shipping_provider'] ?? null
            ),
            OrderStatus::DELIVERED => $order->markAsDelivered(),
            OrderStatus::CANCELLED => $order->cancel($validated['seller_notes'] ?? null),
            default => null,
        };

        // Update seller notes if provided
        if (!empty($validated['seller_notes']) && $newStatus !== OrderStatus::CANCELLED) {
            $order->update(['seller_notes' => $validated['seller_notes']]);
        }

        return back()->with('success', 'অর্ডার স্ট্যাটাস আপডেট হয়েছে।');
    }

    /**
     * Mark order as paid (seller action).
     */
    public function markPaid(Request $request, Order $order): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::MARK_ORDER_PAID->value)) {
            abort(403);
        }

        // Only seller can mark order as paid
        if ($order->seller_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'payment_note' => ['nullable', 'string', 'max:500'],
        ]);

        $order->markAsPaid(null, $request->payment_note);

        return back()->with('success', 'পেমেন্ট স্ট্যাটাস আপডেট হয়েছে।');
    }

    /**
     * Cancel order (buyer action - only if pending).
     */
    public function cancel(Request $request, Order $order): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::CANCEL_ORDER->value)) {
            abort(403);
        }

        // Ensure user is the buyer
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if (!$order->canBeCancelled()) {
            return back()->with('error', 'এই অর্ডার বাতিল করা যাবে না।');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $order->cancel($request->reason);

        return back()->with('success', 'অর্ডার বাতিল হয়েছে।');
    }

    /**
     * Get cart for current user or guest session.
     */
    private function getCart(Request $request): ?Cart
    {
        if ($request->user()) {
            return Cart::where('user_id', $request->user()->id)->first();
        }

        // Guest cart via session
        $sessionId = $request->session()->getId();
        return Cart::where('session_id', $sessionId)->first();
    }
}
