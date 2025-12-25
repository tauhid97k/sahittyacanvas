<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Enums\TransactionStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\Transaction;
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
        $user = $request->user();

        $orders = Order::query()
            ->select([
                'id', 'order_number', 'user_id', 'subtotal', 'shipping_cost', 'total',
                'status', 'payment_status', 'payment_method', 'shipping_name', 'shipping_phone',
                'shipping_city', 'tracking_number', 'created_at'
            ])
            ->with(['buyer:id,name,email', 'items:id,order_id,product_id,product_name,quantity,unit_price,total'])
            ->where('seller_id', $user->id)
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
        $counts = [
            'all' => Order::where('seller_id', $user->id)->count(),
            'pending' => Order::where('seller_id', $user->id)->pending()->count(),
            'confirmed' => Order::where('seller_id', $user->id)->confirmed()->count(),
            'processing' => Order::where('seller_id', $user->id)->processing()->count(),
            'shipped' => Order::where('seller_id', $user->id)->shipped()->count(),
            'delivered' => Order::where('seller_id', $user->id)->delivered()->count(),
            'cancelled' => Order::where('seller_id', $user->id)->cancelled()->count(),
        ];

        return Inertia::render('dashboard/orders/index', [
            'orders' => $orders,
            'counts' => $counts,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'payment' => $request->get('payment', ''),
            ],
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
    public function show(Order $order): Response
    {
        // Ensure user is the seller
        if ($order->seller_id !== auth()->id()) {
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
    public function buyerShow(Order $order): Response
    {
        // Ensure user is the buyer
        if ($order->user_id !== auth()->id()) {
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
     * Checkout - create orders from cart.
     */
    public function checkout(CheckoutRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $cart = Cart::where('user_id', $user->id)->first();

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
            $orderNumbers = [];

            foreach ($itemsBySeller as $sellerId => $items) {
                // Calculate totals for this seller's items
                $subtotal = $items->sum(fn($item) => $item->quantity * $item->product->price);
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
                        'unit_price' => $cartItem->product->price,
                        'total' => $cartItem->quantity * $cartItem->product->price,
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
        // Ensure user is the seller
        if ($order->seller_id !== auth()->id()) {
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
        // Ensure user is the seller
        if ($order->seller_id !== auth()->id()) {
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
        // Ensure user is the buyer
        if ($order->user_id !== auth()->id()) {
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
}
