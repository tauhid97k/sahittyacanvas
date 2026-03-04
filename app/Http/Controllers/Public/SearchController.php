<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Display search results for posts, products, and authors.
     */
    public function index(Request $request): Response
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all');

        $posts = collect();
        $products = collect();
        $authors = collect();

        if (empty($query)) {
            return Inertia::render('public/search/index', [
                'query' => $query,
                'type' => $type,
                'posts' => [],
                'products' => [],
                'authors' => [],
            ]);
        }

        // Search Posts
        if ($type === 'all' || $type === 'posts') {
            $posts = Post::query()
                ->published()
                ->with(['user:id,name,avatar', 'categories:id,name_bn,slug', 'media', 'author:id,name_bn,name_en,slug'])
                ->withTotalVisitCount()
                ->where(function ($q) use ($query) {
                    $q->where('title_bn', 'like', "%{$query}%")
                        ->orWhere('title_en', 'like', "%{$query}%")
                        ->orWhere('excerpt', 'like', "%{$query}%");
                })
                ->latest('published_at')
                ->take(20)
                ->get()
                ->map(fn($post) => [
                    'id' => $post->id,
                    'title' => $post->title_en ?? $post->title_bn,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'featured_image' => $post->getFirstMediaUrl('featured', 'medium') ?: null,
                    'author' => $post->author?->name_bn ?? $post->user?->name ?? 'Unknown',
                    'author_avatar' => $post->author
                        ? ($post->author->getFirstMediaUrl('avatar', 'thumb') ?: null)
                        : $post->user?->avatar,
                    'category' => $post->categories->first() ? [
                        'name' => $post->categories->first()->name_bn,
                        'slug' => $post->categories->first()->slug,
                    ] : null,
                    'views' => $post->visit_count_total ?? 0,
                    'published_at' => $post->published_at?->diffForHumans(),
                ]);
        }

        // Search Products
        if ($type === 'all' || $type === 'products') {
            $products = Product::query()
                ->visible()
                ->with(['media', 'categories:id,name_bn,slug'])
                ->where(function ($q) use ($query) {
                    $q->where('name_bn', 'like', "%{$query}%")
                        ->orWhere('name_en', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->latest()
                ->take(20)
                ->get()
                ->map(fn($product) => [
                    'id' => $product->id,
                    'name' => $product->name_en ?? $product->name_bn,
                    'slug' => $product->slug,
                    'image' => $product->getFirstMediaUrl('images', 'medium') ?: null,
                    'price' => $product->formatted_price,
                    'discounted_price' => $product->formatted_discounted_price,
                    'discount_percentage' => $product->discount_percentage,
                    'in_stock' => $product->stock_count > 0,
                    'category' => $product->categories->first() ? [
                        'name' => $product->categories->first()->name_bn,
                        'slug' => $product->categories->first()->slug,
                    ] : null,
                ]);
        }

        // Search Authors
        if ($type === 'all' || $type === 'authors') {
            $authors = Author::query()
                ->active()
                ->with('media')
                ->withCount('posts')
                ->where(function ($q) use ($query) {
                    $q->where('name_bn', 'like', "%{$query}%")
                        ->orWhere('name_en', 'like', "%{$query}%");
                })
                ->take(10)
                ->get()
                ->map(fn($author) => [
                    'id' => $author->id,
                    'name' => $author->name_en ?? $author->name_bn,
                    'name_bn' => $author->name_bn,
                    'slug' => $author->slug,
                    'avatar' => $author->getFirstMediaUrl('avatar', 'thumb') ?: null,
                    'posts_count' => $author->posts_count,
                ]);
        }

        return Inertia::render('public/search/index', [
            'query' => $query,
            'type' => $type,
            'posts' => $posts,
            'products' => $products,
            'authors' => $authors,
        ]);
    }
}
