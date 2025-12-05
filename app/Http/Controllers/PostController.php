<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
     * Show the form for editing the specified post.
     */
    public function edit(Post $post): Response
    {
        $post->load(['media', 'pages', 'categories']);
        $post->featured_image_url = $post->getFirstMediaUrl('featured') ?: null;

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

        return Inertia::render('dashboard/posts/edit', [
            'post' => $post,
            'categories' => $categories,
            'authors' => $authors,
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
        $content = $validated['content'] ?? '';
        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['featured_image'], $validated['content'], $validated['category_ids']);

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

        // Create first page with content
        $post->pages()->create([
            'title' => null, // Uses post title
            'content' => $content,
            'order' => 10,
            'status' => $validated['status'] === 'published' ? 'published' : 'draft',
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

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
        $content = $validated['content'] ?? '';
        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['featured_image'], $validated['remove_image'], $validated['content'], $validated['category_ids']);

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

        // Handle published_at based on status
        if ($validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        // Sync categories
        $post->categories()->sync($categoryIds);

        // Handle featured image: upload new or remove existing
        if ($image) {
            $post->addMedia($image)->toMediaCollection('featured');
        } elseif ($removeImage) {
            $post->clearMediaCollection('featured');
        }

        // Update first page content
        $firstPage = $post->pages()->orderBy('order')->first();
        if ($firstPage) {
            $firstPage->update([
                'content' => $content,
                'status' => $validated['status'] === 'published' ? 'published' : 'draft',
                'published_at' => $validated['status'] === 'published' ? now() : null,
            ]);
        } else {
            // Create first page if it doesn't exist
            $post->pages()->create([
                'title' => null,
                'content' => $content,
                'order' => 10,
                'status' => $validated['status'] === 'published' ? 'published' : 'draft',
                'published_at' => $validated['status'] === 'published' ? now() : null,
            ]);
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
