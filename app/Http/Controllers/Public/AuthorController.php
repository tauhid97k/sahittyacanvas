<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthorController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Author::query()
            ->active()
            ->with('media')
            ->withCount('posts');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_bn', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });
        }

        $authors = $query
            ->orderByDesc('posts_count')
            ->paginate(24)
            ->through(fn ($author) => [
                'id' => $author->id,
                'name_bn' => $author->name_bn,
                'name_en' => $author->name_en,
                'slug' => $author->slug,
                'avatar' => $author->getFirstMediaUrl('avatar', 'thumb') ?: null,
                'posts_count' => $author->posts_count,
                'birth_date' => $author->birth_date?->format('Y'),
                'death_date' => $author->death_date?->format('Y'),
            ]);

        return Inertia::render('public/authors/index', [
            'authors' => $authors,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $author = Author::query()
            ->where('slug', $slug)
            ->active()
            ->with('media')
            ->withCount('posts')
            ->firstOrFail();

        $posts = Post::query()
            ->published()
            ->where('author_id', $author->id)
            ->with(['user', 'categories', 'media'])
            ->withTotalVisitCount()
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->getFirstMediaUrl('featured', 'medium') ?: null,
                'category' => $post->categories->first() ? [
                    'name' => $post->categories->first()->name_bn,
                    'slug' => $post->categories->first()->slug,
                ] : null,
                'views_count' => $post->visit_count_total ?? 0,
                'likes_count' => $post->likes_count,
                'published_at' => $post->published_at?->toISOString(),
            ]);

        return Inertia::render('public/authors/show', [
            'author' => [
                'id' => $author->id,
                'name_bn' => $author->name_bn,
                'name_en' => $author->name_en,
                'slug' => $author->slug,
                'bio' => $author->bio,
                'avatar' => $author->getFirstMediaUrl('avatar', 'medium') ?: null,
                'banner' => $author->getFirstMediaUrl('banner', 'large') ?: null,
                'birth_date' => $author->birth_date?->format('d M, Y'),
                'death_date' => $author->death_date?->format('d M, Y'),
                'nationality' => $author->nationality,
                'posts_count' => $author->posts_count,
            ],
            'posts' => $posts,
            'breadcrumb' => [
                ['title' => 'হোম', 'href' => '/'],
                ['title' => 'লেখক', 'href' => '/authors'],
                ['title' => $author->name_bn, 'href' => "/author/{$author->slug}"],
            ],
        ]);
    }

    public function userProfile(string $username): Response
    {
        $user = User::query()
            ->where('username', $username)
            ->with('media')
            ->firstOrFail();

        // Get user's posts
        $posts = Post::query()
            ->published()
            ->where('user_id', $user->id)
            ->with(['categories', 'media'])
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
                'category' => $post->categories->first() ? [
                    'name' => $post->categories->first()->name_bn,
                    'slug' => $post->categories->first()->slug,
                ] : null,
                'views_count' => $post->visit_count_total ?? 0,
                'likes_count' => $post->likes_count,
                'published_at' => $post->published_at?->toISOString(),
            ]);

        // Get user's products if they are a seller
        $products = [];
        if ($user->hasRole('seller')) {
            $products = Product::query()
                ->approved()
                ->where('user_id', $user->id)
                ->with('media')
                ->orderByDesc('sales_count')
                ->take(8)
                ->get()
                ->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'discount_price' => $product->discount_price,
                    'image' => $product->getFirstMediaUrl('images', 'medium') ?: null,
                    'rating' => (float) ($product->reviews()->avg('rating') ?? 0),
                    'reviews_count' => $product->reviews()->count(),
                ]);
        }

        // Stats
        $stats = [
            'posts_count' => Post::where('user_id', $user->id)->published()->count(),
            'total_views' => Post::where('user_id', $user->id)->published()->sum('visit_count_total') ?? 0,
            'total_likes' => Post::where('user_id', $user->id)->published()->sum('likes_count'),
            'followers_count' => $user->followers()->count(),
        ];

        if ($user->hasRole('seller')) {
            $stats['products_count'] = Product::where('user_id', $user->id)->approved()->count();
            $stats['total_sales'] = Product::where('user_id', $user->id)->approved()->sum('sales_count');
        }

        return Inertia::render('public/users/profile', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
                'banner' => $user->getFirstMediaUrl('banner', 'large') ?: null,
                'is_seller' => $user->hasRole('seller'),
                'joined_at' => $user->created_at->format('M Y'),
            ],
            'posts' => $posts,
            'products' => $products,
            'stats' => $stats,
            'breadcrumb' => [
                ['title' => 'হোম', 'href' => '/'],
                ['title' => $user->name, 'href' => "/@{$user->username}"],
            ],
        ]);
    }
}
