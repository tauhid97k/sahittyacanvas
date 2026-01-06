<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use App\Models\ModerationSetting;
use App\Models\User;
use App\Notifications\NewPostPublished;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $trashed = $request->boolean('trashed');
        
        $posts = Post::query()
            ->select([
                'id', 'user_id', 'author_id', 'title_bn', 'title_en', 'slug', 
                'excerpt', 'status', 'published_at', 'created_at', 'deleted_at',
                'likes_count', 'comments_count', 'bookmarks_count'
            ])
            ->when($trashed, fn ($q) => $q->onlyTrashed())
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
                'trashed' => $trashed,
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

        // Handle moderation and publishing
        if ($validated['status'] === 'published') {
            if (empty($validated['published_at'])) {
                $validated['published_at'] = now();
            }
            
            // Check if moderation is required
            if (ModerationSetting::postsRequireApproval()) {
                $validated['moderation_status'] = 'pending';
            } else {
                $validated['moderation_status'] = 'auto';
            }
        }

        $createPage = $request->boolean('_create_page');

        $post = DB::transaction(function () use ($validated, $image, $categoryIds, $request, $createPage) {
            $post = Post::create($validated);

            // Link any EditorMedia images from content to this post
            $this->linkEditorImagesToPost($post, $validated['content'] ?? '');

            // Auto-assign AUTHOR role on first post creation
            $user = $request->user();
            if (!$user->hasRole('AUTHOR')) {
                $user->assignRole('AUTHOR');
            }

            // Sync categories
            if (!empty($categoryIds)) {
                $post->categories()->sync($categoryIds);
            }

            // Handle featured image upload
            if ($image) {
                $post->addMedia($image)->toMediaCollection('featured');
            }

            // Check if user wants to create a new page immediately
            if ($createPage) {
                $post->pages()->create([
                    'content' => null,
                    'order' => 2,
                ]);
                $post->increment('pages_count');
            }

            return $post;
        });

        // Notify all users (except author) when post is published and approved
        // This is outside the transaction as it's not critical
        if ($validated['status'] === 'published' && $post->moderation_status !== 'pending') {
            $author = $request->user();
            $usersToNotify = User::where('id', '!=', $author->id)->get();
            Notification::send($usersToNotify, new NewPostPublished($post, $author));
        }

        if ($createPage) {
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
        $wasPublished = $post->status === 'published';

        // Handle published_at based on status
        if ($isNewlyPublished) {
            $validated['published_at'] = now();
        }

        // Handle moderation when publishing or re-publishing after edit
        if ($validated['status'] === 'published') {
            if (ModerationSetting::postsRequireApproval()) {
                // Reset to pending if content was edited and post was already published
                if ($wasPublished && $post->moderation_status !== 'pending') {
                    $validated['moderation_status'] = 'pending';
                    $validated['moderated_at'] = null;
                    $validated['moderated_by'] = null;
                } elseif ($isNewlyPublished) {
                    $validated['moderation_status'] = 'pending';
                }
            } else {
                // No moderation required
                if ($isNewlyPublished || $post->moderation_status === 'pending') {
                    $validated['moderation_status'] = 'auto';
                }
            }
        }

        DB::transaction(function () use ($post, $validated, $categoryIds, $image, $removeImage) {
            $post->update($validated);

            // Sync categories
            $post->categories()->sync($categoryIds);

            // Handle featured image: upload new or remove existing
            if ($image) {
                $post->addMedia($image)->toMediaCollection('featured');
            } elseif ($removeImage) {
                $post->clearMediaCollection('featured');
            }
        });

        // Notify users when post is published for the first time and approved
        // This is outside the transaction as it's not critical
        if ($isNewlyPublished && $post->moderation_status !== 'pending') {
            $author = $request->user();
            $usersToNotify = User::where('id', '!=', $author->id)->get();
            Notification::send($usersToNotify, new NewPostPublished($post, $author));
        }

        return back()->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified post (soft delete).
     */
    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'পোস্ট রিসাইকেল বিনে সরানো হয়েছে।');
    }

    /**
     * Restore a soft-deleted post.
     */
    public function restore(int $id): RedirectResponse
    {
        $post = Post::withTrashed()->findOrFail($id);
        $post->restore();

        return back()->with('success', 'পোস্ট পুনরুদ্ধার করা হয়েছে।');
    }

    /**
     * Permanently delete a post.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $post = Post::withTrashed()->with('pages')->findOrFail($id);
        
        DB::transaction(function () use ($post) {
            // Clear all media collections
            $post->clearMediaCollection('featured');
            $post->clearMediaCollection('editor_images');
            $post->clearMediaCollection('gallery');
            $post->clearMediaCollection('attachments');
            
            // Also clean up any legacy EditorMedia images that might be in the content
            $this->cleanupLegacyEditorImages($post);
            
            $post->forceDelete();
        });

        return back()->with('success', 'Post permanently deleted.');
    }

    /**
     * Clean up legacy EditorMedia images that were uploaded before linking to posts.
     */
    private function cleanupLegacyEditorImages(Post $post): void
    {
        // Collect all content to search for editor images
        $allContent = $post->content ?? '';
        foreach ($post->pages as $page) {
            $allContent .= ' ' . ($page->content ?? '');
        }
        
        // Match all image URLs from the content
        preg_match_all('/src=["\']([^"\']+)["\']/', $allContent, $matches);
        
        if (empty($matches[1])) {
            return;
        }

        $urls = array_unique($matches[1]);
        
        foreach ($urls as $url) {
            // Find media by URL (only for EditorMedia - legacy images)
            $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::where('model_type', \App\Models\EditorMedia::class)
                ->get()
                ->first(function ($media) use ($url) {
                    return $media->getUrl() === $url ||
                           str_contains($url, $media->file_name);
                });

            if ($media) {
                $editorMedia = \App\Models\EditorMedia::find($media->model_id);
                $media->delete();
                
                // Delete the EditorMedia record if it has no more media
                if ($editorMedia && $editorMedia->media()->count() === 0) {
                    $editorMedia->delete();
                }
            }
        }
    }

    /**
     * Link EditorMedia images from content to a post.
     * This moves images from EditorMedia to the Post's editor_images collection.
     */
    private function linkEditorImagesToPost(Post $post, string $content): void
    {
        if (empty($content)) {
            return;
        }

        // Match all image URLs from the content
        preg_match_all('/src=["\']([^"\']+)["\']/', $content, $matches);
        
        if (empty($matches[1])) {
            return;
        }

        $urls = array_unique($matches[1]);
        
        foreach ($urls as $url) {
            // Find media in EditorMedia
            $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::where('model_type', \App\Models\EditorMedia::class)
                ->get()
                ->first(function ($media) use ($url) {
                    return $media->getUrl() === $url ||
                           str_contains($url, $media->file_name);
                });

            if ($media) {
                $editorMedia = \App\Models\EditorMedia::find($media->model_id);
                
                // Move media to the post
                $media->model_type = Post::class;
                $media->model_id = $post->id;
                $media->collection_name = 'editor_images';
                $media->save();
                
                // Delete the EditorMedia record if it has no more media
                if ($editorMedia && $editorMedia->media()->count() === 0) {
                    $editorMedia->delete();
                }
            }
        }
    }
}
