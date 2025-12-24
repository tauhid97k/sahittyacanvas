<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\ModerationSetting;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    /**
     * Display the moderation queue.
     */
    public function index(Request $request): Response
    {
        $tab = $request->get('tab', 'posts');

        // Pending posts (requires_approval = true and approved_at = null)
        $pendingPosts = Post::query()
            ->select([
                'id', 'user_id', 'author_id', 'title_bn', 'title_en', 'slug',
                'excerpt', 'status', 'requires_approval', 'approved_at', 'created_at',
            ])
            ->with([
                'user:id,name,email',
                'author:id,name_bn,name_en',
                'categories:id,name_bn,name_en',
            ])
            ->where('requires_approval', true)
            ->whereNull('approved_at')
            ->when($request->filled('search') && $tab === 'posts', function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title_bn', 'like', "%{$search}%")
                        ->orWhere('title_en', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10, ['*'], 'posts_page')
            ->withQueryString();

        // Add featured image URL
        $pendingPosts->through(function ($post) {
            $post->featured_image_url = $post->getFirstMediaUrl('featured') ?: null;
            return $post;
        });

        // Pending comments
        $pendingComments = Comment::query()
            ->with([
                'user:id,name,email,avatar',
                'post:id,title_bn,title_en,slug',
            ])
            ->where('is_approved', false)
            ->when($request->filled('search') && $tab === 'comments', function ($query) use ($request) {
                $search = $request->get('search');
                $query->where('content', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10, ['*'], 'comments_page')
            ->withQueryString();

        return Inertia::render('dashboard/moderation/index', [
            'pendingPosts' => $pendingPosts,
            'pendingComments' => $pendingComments,
            'filters' => [
                'tab' => $tab,
                'search' => $request->get('search', ''),
            ],
            'counts' => [
                'posts' => Post::where('requires_approval', true)->whereNull('approved_at')->count(),
                'comments' => Comment::where('is_approved', false)->count(),
            ],
            'settings' => [
                'posts_require_approval' => ModerationSetting::postsRequireApproval(),
                'comments_require_approval' => ModerationSetting::commentsRequireApproval(),
            ],
        ]);
    }

    /**
     * Approve a post.
     */
    public function approvePost(Request $request, Post $post): RedirectResponse
    {
        $post->update([
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'status' => 'published',
        ]);

        return back()->with('success', 'Post approved and published successfully.');
    }

    /**
     * Reject a post.
     */
    public function rejectPost(Post $post): RedirectResponse
    {
        $post->update([
            'requires_approval' => false,
            'status' => 'draft',
        ]);

        return back()->with('success', 'Post rejected and moved to draft.');
    }

    /**
     * Approve a comment.
     */
    public function approveComment(Comment $comment): RedirectResponse
    {
        $comment->update(['is_approved' => true]);

        return back()->with('success', 'Comment approved successfully.');
    }

    /**
     * Reject/delete a comment.
     */
    public function rejectComment(Comment $comment): RedirectResponse
    {
        $comment->update(['moderation_status' => 'rejected']);
        $comment->delete();

        return back()->with('success', 'Comment rejected and deleted.');
    }

    /**
     * Update moderation settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'key' => 'required|string|in:posts_require_approval,comments_require_approval',
            'value' => 'required|boolean',
        ]);

        ModerationSetting::setValue($request->key, $request->value);

        return back();
    }
}
