<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use App\Notifications\NewPostPublished;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Display a listing of posts.
     */
    public function index(Request $request): Response
    {
        $posts = Post::query()
            ->select([
                'id', 'user_id', 'author_id', 'title_bn', 'title_en', 'slug', 
                'excerpt', 'status', 'published_at', 'created_at',
                'likes_count', 'comments_count', 'bookmarks_count'
            ])
            ->with([
                'user:id,name',
                'author:id,name_bn,name_en,slug',
                'categories:id,name_bn,name_en,slug',
                'media',
            ])
            ->withTotalVisitCount()
            ->withCount('pages')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title_bn', 'like', "%{$search}%")
                      ->orWhere('title_en', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('categories.id', $request->get('category'));
                });
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Add featured image URL to each post
        $posts->through(function ($post) {
            $post->featured_image_url = $post->getFirstMediaUrl('featured') ?: null;
            return $post;
        });

        // Get filter options
        $categories = Category::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'category' => $request->get('category', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new post.
     */
    public function create(): Response
    {
        $categories = Category::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->ordered()
            ->get();

        $authors = Author::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->orderBy('name_bn')
            ->get();

        return Inertia::render('dashboard/posts/create', [
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    /**
     * Display the specified post (admin preview).
     * Supports ?page=N query param for multi-page viewing.
     */
    public function show(Request $request, Post $post): Response
    {
        $post->load(['media', 'pages', 'categories', 'author', 'user']);
        $post->featured_image_url = $post->getFirstMediaUrl('featured') ?: null;

        // Get current page number from query (default: 1 = main post content)
        $currentPage = (int) $request->query('page', 1);
        
        // Get the page data if viewing page 2+
        $currentPageData = null;
        if ($currentPage > 1) {
            $currentPageData = $post->pages()->where('order', $currentPage)->first();
        }

        // Get actual page orders (for navigation)
        $pageOrders = [1, ...$post->pages->pluck('order')->toArray()];

        return Inertia::render('dashboard/posts/show', [
            'post' => $post,
            'currentPage' => $currentPage,
            'currentPageData' => $currentPageData,
            'pageOrders' => $pageOrders,
        ]);
    }

    /**
     * Show the form for editing the specified post.
     * Supports ?page=N query param for multi-page editing.
     */
    public function edit(Request $request, Post $post): Response|RedirectResponse
    {
        $post->load(['media', 'pages', 'categories']);
        $post->featured_image_url = $post->getFirstMediaUrl('featured') ?: null;

        // Get current page number from query (default: 1 = main post content)
        $currentPage = (int) $request->query('page', 1);
        
        // Get the page data if editing page 2+
        $currentPageData = null;
        if ($currentPage > 1) {
            $currentPageData = $post->pages()->where('order', $currentPage)->first();
            
            // If page doesn't exist, redirect to main post
            if (!$currentPageData) {
                return redirect()->route('posts.edit', $post->slug);
            }
        }

        $categories = Category::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->ordered()
            ->get();

        $authors = Author::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->orderBy('name_bn')
            ->get();

        // Get actual page orders (for navigation buttons)
        $pageOrders = $post->pages->pluck('order')->toArray();

        return Inertia::render('dashboard/posts/edit', [
            'post' => $post,
            'categories' => $categories,
            'authors' => $authors,
            'currentPage' => $currentPage,
            'currentPageData' => $currentPageData,
            'pageOrders' => $pageOrders,
        ]);
    }

    /**
     * Store a newly created post.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Remove fields handled separately
        $image = $validated['featured_image'] ?? null;
        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['featured_image'], $validated['category_ids']);

        // Generate slug from title_en
        $validated['slug'] = Str::slug($validated['title_en']);

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Post::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        // Set user_id
        $validated['user_id'] = $request->user()->id;

        // Handle published_at based on status
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        // Sync categories
        if (!empty($categoryIds)) {
            $post->categories()->sync($categoryIds);
        }

        // Handle featured image upload
        if ($image) {
            $post->addMedia($image)->toMediaCollection('featured');
        }

        // Notify all users (except author) when post is published
        if ($validated['status'] === 'published') {
            $author = $request->user();
            $usersToNotify = User::where('id', '!=', $author->id)->get();
            Notification::send($usersToNotify, new NewPostPublished($post, $author));
        }

        // Check if user wants to create a new page immediately
        if ($request->boolean('_create_page')) {
            // Create page 2
            $post->pages()->create([
                'content' => null,
                'order' => 2,
            ]);
            $post->increment('pages_count');

            return redirect()
                ->route('posts.edit', ['post' => $post->slug, 'page' => 2])
                ->with('success', 'Post created. Add content for page 2.');
        }

        return redirect()->route('posts.index')->with('success', 'Post created successfully.');
    }

    /**
     * Update the specified post.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $validated = $request->validated();

        // Remove fields handled separately
        $image = $validated['featured_image'] ?? null;
        $removeImage = $validated['remove_image'] ?? false;
        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['featured_image'], $validated['remove_image'], $validated['category_ids']);

        // Regenerate slug if title_en changed
        if ($validated['title_en'] !== $post->title_en) {
            $validated['slug'] = Str::slug($validated['title_en']);

            // Ensure unique slug (excluding current)
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter++;
            }
        }

        // Track if post is being published for the first time
        $isNewlyPublished = $validated['status'] === 'published' && !$post->published_at;

        // Handle published_at based on status
        if ($isNewlyPublished) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        // Notify users when post is published for the first time
        if ($isNewlyPublished) {
            $author = $request->user();
            $usersToNotify = User::where('id', '!=', $author->id)->get();
            Notification::send($usersToNotify, new NewPostPublished($post, $author));
        }

        // Sync categories
        $post->categories()->sync($categoryIds);

        // Handle featured image: upload new or remove existing
        if ($image) {
            $post->addMedia($image)->toMediaCollection('featured');
        } elseif ($removeImage) {
            $post->clearMediaCollection('featured');
        }

        return back()->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified post.
     */
    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Post deleted successfully.');
    }
}
