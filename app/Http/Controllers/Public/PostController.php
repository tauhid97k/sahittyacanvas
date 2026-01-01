<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Post::query()
            ->published()
            ->with(['user', 'categories', 'media', 'author'])
            ->withTotalVisitCount();

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('categories', fn ($q) => $q->where('slug', $request->category));
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'popular' => $query->orderByDesc('visit_count_total'),
            'liked' => $query->orderByDesc('likes_count'),
            default => $query->latest('published_at'),
        };

        $posts = $query->paginate(12)->through(fn ($post) => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'featured_image' => $post->getFirstMediaUrl('featured', 'medium') ?: null,
            'author' => $post->author ? [
                'id' => $post->author->id,
                'name' => $post->author->name_bn,
                'slug' => $post->author->slug,
            ] : null,
            'user' => [
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
            'comments_count' => $post->comments_count,
            'published_at' => $post->published_at?->toISOString(),
        ]);

        $categories = Category::query()
            ->active()
            ->root()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->ordered()
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name_bn' => $cat->name_bn,
                'slug' => $cat->slug,
                'posts_count' => $cat->posts_count,
            ]);

        return Inertia::render('public/posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::query()
            ->where('slug', $slug)
            ->published()
            ->with([
                'user',
                'author',
                'categories',
                'media',
                'pages' => fn ($q) => $q->published()->ordered(),
                'comments' => fn ($q) => $q->approved()->whereNull('parent_id')->with([
                    'user',
                    'children' => fn ($q) => $q->approved()->with('user'),
                ]),
            ])
            ->withTotalVisitCount()
            ->withCount(['likes', 'bookmarks', 'comments'])
            ->firstOrFail();

        // Record visit
        $post->visit();

        // Get related posts
        $relatedPosts = Post::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->whereHas('categories', fn ($q) => $q->whereIn('id', $post->categories->pluck('id')))
            ->with(['user', 'categories', 'media'])
            ->withTotalVisitCount()
            ->take(4)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'featured_image' => $p->getFirstMediaUrl('featured', 'thumb') ?: null,
                'views_count' => $p->visit_count_total ?? 0,
            ]);

        return Inertia::render('public/posts/show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->getFirstMediaUrl('featured', 'large') ?: null,
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'name_bn' => $post->author->name_bn,
                    'name_en' => $post->author->name_en,
                    'slug' => $post->author->slug,
                    'avatar' => $post->author->getFirstMediaUrl('avatar', 'thumb') ?: null,
                    'bio' => $post->author->bio,
                ] : null,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar' => $post->user->avatar,
                ],
                'categories' => $post->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_bn' => $cat->name_bn,
                    'slug' => $cat->slug,
                ]),
                'pages' => $post->pages->map(fn ($page, $index) => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'content' => $page->content,
                    'order' => $index + 2,
                ]),
                'comments' => $post->comments->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar,
                    ],
                    'created_at' => $comment->created_at->toISOString(),
                    'children' => $comment->children->map(fn ($child) => [
                        'id' => $child->id,
                        'content' => $child->content,
                        'user' => [
                            'id' => $child->user->id,
                            'name' => $child->user->name,
                            'avatar' => $child->user->avatar,
                        ],
                        'created_at' => $child->created_at->toISOString(),
                    ]),
                ]),
                'views_count' => $post->visit_count_total ?? 0,
                'likes_count' => $post->likes_count,
                'bookmarks_count' => $post->bookmarks_count,
                'comments_count' => $post->comments_count,
                'published_at' => $post->published_at?->toISOString(),
            ],
            'relatedPosts' => $relatedPosts,
            'seo' => $post->getDynamicSEOData(),
        ]);
    }

    public function category(string $slug): Response
    {
        $category = Category::where('slug', $slug)->active()->firstOrFail();

        $posts = Post::query()
            ->published()
            ->whereHas('categories', fn ($q) => $q->where('categories.id', $category->id))
            ->with(['user', 'categories', 'media', 'author'])
            ->withTotalVisitCount()
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'featured_image' => $post->getFirstMediaUrl('featured', 'medium') ?: null,
                'author' => $post->author ? [
                    'id' => $post->author->id,
                    'name' => $post->author->name_bn,
                    'slug' => $post->author->slug,
                ] : null,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar' => $post->user->avatar,
                ],
                'views_count' => $post->visit_count_total ?? 0,
                'likes_count' => $post->likes_count,
                'published_at' => $post->published_at?->toISOString(),
            ]);

        // Get subcategories
        $subcategories = $category->children()
            ->active()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->ordered()
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name_bn' => $cat->name_bn,
                'slug' => $cat->slug,
                'posts_count' => $cat->posts_count,
            ]);

        // Breadcrumb
        $breadcrumb = $category->ancestorsAndSelf()
            ->get()
            ->map(fn ($cat) => [
                'title' => $cat->name_bn,
                'href' => "/category/{$cat->slug}",
            ])
            ->toArray();

        array_unshift($breadcrumb, ['title' => 'হোম', 'href' => '/']);

        return Inertia::render('public/posts/category', [
            'category' => [
                'id' => $category->id,
                'name_bn' => $category->name_bn,
                'name_en' => $category->name_en,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->getFirstMediaUrl('image', 'large') ?: null,
            ],
            'posts' => $posts,
            'subcategories' => $subcategories,
            'breadcrumb' => $breadcrumb,
        ]);
    }
}
