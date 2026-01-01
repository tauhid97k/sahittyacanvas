<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $recentPosts = Post::query()
            ->published()
            ->with(['user', 'categories', 'media'])
            ->withTotalVisitCount()
            ->latest('published_at')
            ->take(8)
            ->get()
            ->map(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->getFirstMediaUrl('featured', 'medium') ?: null,
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar' => $post->user->avatar,
                ],
                'category' => $post->categories->first() ? [
                    'name' => $post->categories->first()->name_bn,
                    'slug' => $post->categories->first()->slug,
                ] : null,
                'views_count' => $post->visit_count_total ?? 0,
                'likes_count' => $post->likes_count,
                'published_at' => $post->published_at?->toISOString(),
            ]);

        $popularProducts = Product::query()
            ->approved()
            ->with(['user', 'categories', 'media'])
            ->orderByDesc('sales_count')
            ->take(4)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'discount_price' => $product->discount_price,
                'image' => $product->getFirstMediaUrl('images', 'medium') ?: null,
                'seller' => [
                    'id' => $product->user->id,
                    'name' => $product->user->name,
                ],
                'categories' => $product->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name_bn,
                    'slug' => $cat->slug,
                ]),
                'rating' => (float) ($product->reviews()->avg('rating') ?? 0),
                'reviews_count' => $product->reviews()->count(),
            ]);

        $famousAuthors = Author::query()
            ->active()
            ->with('media')
            ->withCount('posts')
            ->orderByDesc('posts_count')
            ->take(6)
            ->get()
            ->map(fn ($author) => [
                'id' => $author->id,
                'name_bn' => $author->name_bn,
                'name_en' => $author->name_en,
                'slug' => $author->slug,
                'avatar' => $author->getFirstMediaUrl('avatar', 'thumb') ?: null,
                'posts_count' => $author->posts_count,
            ]);

        $categories = Category::query()
            ->active()
            ->root()
            ->with('media')
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->ordered()
            ->take(6)
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name_bn' => $cat->name_bn,
                'slug' => $cat->slug,
                'image' => $cat->getFirstMediaUrl('image', 'thumb') ?: null,
                'posts_count' => $cat->posts_count,
            ]);

        return Inertia::render('public/home/index', [
            'recentPosts' => $recentPosts,
            'popularProducts' => $popularProducts,
            'famousAuthors' => $famousAuthors,
            'categories' => $categories,
        ]);
    }
}
