<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductReviewController extends Controller
{
    /**
     * Display a listing of product reviews for admin.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_PRODUCT_REVIEW->value)) {
            abort(403);
        }

        $reviews = ProductReview::query()
            ->with([
                'user:id,name,username,avatar',
                'user.roles:id,name',
                'product:id,name_bn,name_en,slug',
            ])
            ->when($request->filled('rating'), function ($query) use ($request) {
                $query->where('rating', $request->get('rating'));
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('dashboard/product-reviews/index', [
            'reviews' => $reviews,
            'filters' => [
                'rating' => $request->get('rating', ''),
            ],
        ]);
    }

    /**
     * Store a new product review (buyer action).
     * Buyer can only review products from delivered orders.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'order_id' => ['required', 'exists:orders,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:1000'],
        ], [
            'rating.required' => 'রেটিং আবশ্যক।',
            'rating.min' => 'রেটিং কমপক্ষে ১ হতে হবে।',
            'rating.max' => 'রেটিং সর্বোচ্চ ৫ হতে পারে।',
        ]);

        $user = $request->user();

        // Verify the order belongs to the buyer and is delivered
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $user->id)
            ->where('status', 'delivered')
            ->firstOrFail();

        // Verify the product was in this order
        $orderItem = $order->items()->where('product_id', $validated['product_id'])->first();
        if (!$orderItem) {
            return back()->with('error', 'এই অর্ডারে এই পণ্যটি নেই।');
        }

        // Check if already reviewed
        $existingReview = ProductReview::where('product_id', $validated['product_id'])
            ->where('user_id', $user->id)
            ->where('order_id', $validated['order_id'])
            ->first();

        if ($existingReview) {
            return back()->with('error', 'আপনি ইতিমধ্যে এই পণ্যের রিভিউ দিয়েছেন।');
        }

        ProductReview::create([
            'product_id' => $validated['product_id'],
            'user_id' => $user->id,
            'order_id' => $validated['order_id'],
            'rating' => $validated['rating'],
            'review' => $validated['review'],
            'is_verified_purchase' => true,
        ]);

        return back()->with('success', 'রিভিউ সফলভাবে জমা হয়েছে।');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Request $request, ProductReview $review): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::DELETE_PRODUCT_REVIEW->value)) {
            abort(403);
        }

        $review->delete();

        return redirect()
            ->route('product-reviews.index')
            ->with('success', 'Review deleted successfully.');
    }
}
