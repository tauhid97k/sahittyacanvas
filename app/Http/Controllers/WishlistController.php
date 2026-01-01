<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $wishlistItems = Wishlist::where('user_id', $request->user()->id)
            ->with(['product' => fn ($q) => $q->with(['user', 'media'])])
            ->latest()
            ->paginate(10);

        $products = $wishlistItems->through(fn ($item) => [
            'id' => $item->product->id,
            'name' => $item->product->name,
            'slug' => $item->product->slug,
            'price' => $item->product->price,
            'discount_price' => $item->product->discount_price,
            'image' => $item->product->getFirstMediaUrl('images', 'medium') ?: null,
            'seller' => [
                'id' => $item->product->user->id,
                'name' => $item->product->user->name,
            ],
            'rating' => (float) ($item->product->reviews()->avg('rating') ?? 0),
            'reviews_count' => $item->product->reviews()->count(),
            'in_stock' => $item->product->stock > 0,
            'added_at' => $item->created_at->format('Y-m-d'),
        ]);

        return Inertia::render('dashboard/wishlist/index', [
            'products' => $products,
        ]);
    }

    public function toggle(Request $request, Product $product): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'added' => false,
                'message' => 'Product removed from wishlist.',
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'added' => true,
            'message' => 'Product added to wishlist.',
        ]);
    }

    public function remove(Request $request, Product $product): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json([
            'message' => 'Product removed from wishlist.',
        ]);
    }

    public function check(Request $request, Product $product): JsonResponse
    {
        $inWishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json([
            'in_wishlist' => $inWishlist,
        ]);
    }
}
