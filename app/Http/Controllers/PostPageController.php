<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostPage;
use App\Http\Requests\Post\UpdatePostPageRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostPageController extends Controller
{
    /**
     * Create a new page for a post and redirect to edit it.
     * Validates that the current page has content before allowing new page creation.
     */
    public function store(Request $request, Post $post): RedirectResponse
    {
        // Get the current page number from referer or request
        $currentPageOrder = (int) $request->query('from_page', 1);
        
        // Validate: current page must have content before creating a new page
        if ($currentPageOrder === 1) {
            // Check main post content
            if (empty(trim($post->content ?? ''))) {
                return back()->withErrors([
                    'content' => 'Please add content to the current page before creating a new page.',
                ]);
            }
        } else {
            // Check the current page's content
            $currentPage = $post->pages()->where('order', $currentPageOrder)->first();
            if (!$currentPage || empty(trim($currentPage->content ?? ''))) {
                return back()->withErrors([
                    'content' => 'Please add content to the current page before creating a new page.',
                ]);
            }
        }

        $nextOrder = null;

        // Use transaction with lock to prevent race conditions
        DB::transaction(function () use ($post, &$nextOrder) {
            // Lock the post row to prevent concurrent page creation
            $post->lockForUpdate()->first();

            // Get the next page order (page 2, 3, 4...)
            $lastPage = $post->pages()->max('order') ?? 1;
            $nextOrder = $lastPage + 1;

            $post->pages()->create([
                'content' => null, // Empty, will be required on save
                'order' => $nextOrder,
            ]);

            // Increment pages_count
            $post->increment('pages_count');
        });

        return redirect()
            ->route('posts.edit', ['post' => $post->slug, 'page' => $nextOrder])
            ->with('info', 'New page created. Add your content and save.');
    }

    /**
     * Update a page's content.
     */
    public function update(UpdatePostPageRequest $request, Post $post, PostPage $page): RedirectResponse
    {
        // Ensure page belongs to post
        if ($page->post_id !== $post->id) {
            abort(404);
        }

        $page->update([
            'content' => $request->validated('content'),
        ]);

        return back()->with('success', 'Page updated successfully.');
    }

    /**
     * Delete a page and redirect appropriately.
     */
    public function destroy(Post $post, PostPage $page): RedirectResponse
    {
        // Ensure page belongs to post
        if ($page->post_id !== $post->id) {
            abort(404);
        }

        $deletedOrder = $page->order;

        // Delete page and update count using transaction
        DB::transaction(function () use ($post, $page) {
            $page->delete();
            $post->decrement('pages_count');
        });

        // Determine redirect: previous page or original post
        $previousPage = $deletedOrder > 2 ? $deletedOrder - 1 : null;

        if ($previousPage) {
            return redirect()
                ->route('posts.edit', ['post' => $post->slug, 'page' => $previousPage])
                ->with('success', 'Page deleted successfully.');
        }

        return redirect()
            ->route('posts.edit', $post->slug)
            ->with('success', 'Page deleted successfully.');
    }
}
