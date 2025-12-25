<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Display the cart.
     */
    public function index(Request $request): Response
    {
        $cart = $this->getCart($request);

        $cart->load([
            'items.product' => function ($query) {
                $query->select('id', 'user_id', 'name_bn', 'name_en', 'slug', 'price', 'stock_count', 'status', 'moderation_status')
                    ->with(['media', 'user:id,name']);
            }
        ]);

        // Transform items with computed attributes
        $items = $cart->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'unit_price_in_taka' => $item->unit_price_in_taka,
                'formatted_unit_price' => $item->formatted_unit_price,
                'total' => $item->total,
                'total_in_taka' => $item->total_in_taka,
                'formatted_total' => $item->formatted_total,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name_bn' => $item->product->name_bn,
                    'name_en' => $item->product->name_en,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'price_in_taka' => $item->product->price_in_taka,
                    'formatted_price' => $item->product->formatted_price,
                    'stock_count' => $item->product->stock_count,
                    'is_available' => $item->product->isVisible() && $item->product->isInStock(),
                    'featured_image_url' => $item->product->featured_image_url,
                    'seller' => $item->product->user ? [
                        'id' => $item->product->user->id,
                        'name' => $item->product->user->name,
                    ] : null,
                ] : null,
            ];
        });

        return Inertia::render('cart/index', [
            'cart' => [
                'items' => $items,
                'total_items' => $cart->total_items,
                'subtotal' => $cart->subtotal,
                'subtotal_in_taka' => $cart->subtotal_in_taka,
                'formatted_subtotal' => $cart->formatted_subtotal,
            ],
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(AddToCartRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();
        $product = Product::findOrFail($validated['product_id']);

        // Check if product is available
        if (!$product->isVisible()) {
            return $this->errorResponse($request, 'এই পণ্যটি বর্তমানে উপলব্ধ নয়।');
        }

        if (!$product->isInStock()) {
            return $this->errorResponse($request, 'এই পণ্যটি স্টকে নেই।');
        }

        if ($product->stock_count < $validated['quantity']) {
            return $this->errorResponse($request, "শুধুমাত্র {$product->stock_count}টি পণ্য স্টকে আছে।");
        }

        $cart = $this->getCart($request);

        // Check if product already in cart
        $existingItem = $cart->items()->where('product_id', $product->id)->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $validated['quantity'];

            if ($newQuantity > $product->stock_count) {
                return $this->errorResponse($request, "শুধুমাত্র {$product->stock_count}টি পণ্য স্টকে আছে।");
            }

            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $product->price, // Store current price in cents
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'পণ্য কার্টে যোগ হয়েছে।',
                'cart_count' => $cart->fresh()->total_items,
            ]);
        }

        return back()->with('success', 'পণ্য কার্টে যোগ হয়েছে।');
    }

    /**
     * Update cart item quantity.
     */
    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse|JsonResponse
    {
        $cart = $this->getCart($request);

        // Ensure item belongs to user's cart
        if ($cartItem->cart_id !== $cart->id) {
            abort(403);
        }

        $validated = $request->validated();
        $product = $cartItem->product;

        // Check stock
        if ($product && $validated['quantity'] > $product->stock_count) {
            return $this->errorResponse($request, "শুধুমাত্র {$product->stock_count}টি পণ্য স্টকে আছে।");
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'কার্ট আপডেট হয়েছে।',
                'item' => [
                    'quantity' => $cartItem->quantity,
                    'total_in_taka' => $cartItem->total_in_taka,
                    'formatted_total' => $cartItem->formatted_total,
                ],
                'cart' => [
                    'total_items' => $cart->fresh()->total_items,
                    'subtotal_in_taka' => $cart->fresh()->subtotal_in_taka,
                    'formatted_subtotal' => $cart->fresh()->formatted_subtotal,
                ],
            ]);
        }

        return back()->with('success', 'কার্ট আপডেট হয়েছে।');
    }

    /**
     * Remove item from cart.
     */
    public function destroy(Request $request, CartItem $cartItem): RedirectResponse|JsonResponse
    {
        $cart = $this->getCart($request);

        // Ensure item belongs to user's cart
        if ($cartItem->cart_id !== $cart->id) {
            abort(403);
        }

        $cartItem->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'পণ্য কার্ট থেকে সরানো হয়েছে।',
                'cart_count' => $cart->fresh()->total_items,
            ]);
        }

        return back()->with('success', 'পণ্য কার্ট থেকে সরানো হয়েছে।');
    }

    /**
     * Clear entire cart.
     */
    public function clear(Request $request): RedirectResponse|JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->clear();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'কার্ট খালি করা হয়েছে।',
            ]);
        }

        return back()->with('success', 'কার্ট খালি করা হয়েছে।');
    }

    /**
     * Get cart count (for header badge).
     */
    public function count(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        return response()->json([
            'count' => $cart->total_items,
        ]);
    }

    /**
     * Get or create cart for current user/session.
     */
    private function getCart(Request $request): Cart
    {
        $user = $request->user();

        if ($user) {
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            // Merge guest cart if exists
            $sessionId = $request->session()->getId();
            $guestCart = Cart::where('session_id', $sessionId)->first();

            if ($guestCart && $guestCart->id !== $cart->id) {
                $cart->mergeFrom($guestCart);
            }

            return $cart;
        }

        // Guest cart
        $sessionId = $request->session()->getId();
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Return error response based on request type.
     */
    private function errorResponse(Request $request, string $message): RedirectResponse|JsonResponse
    {
        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
            ], 422);
        }

        return back()->with('error', $message);
    }
}
