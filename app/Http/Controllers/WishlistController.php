<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
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

    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $userId = $request->user()->id;

        $existing = Wishlist::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'পছন্দ তালিকা থেকে সরানো হয়েছে');
        }

        Wishlist::create([
            'user_id' => $userId,
            'product_id' => $product->id,
        ]);

        return back()->with('success', 'পছন্দ তালিকায় যোগ করা হয়েছে');
    }

    public function remove(Request $request, Product $product): RedirectResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return back()->with('success', 'পছন্দ তালিকা থেকে সরানো হয়েছে');
    }

    public function check(Request $request, Product $product): RedirectResponse
    {
        $inWishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        return back()->with('in_wishlist', $inWishlist);
    }
}
