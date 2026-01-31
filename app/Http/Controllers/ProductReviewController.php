<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
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
