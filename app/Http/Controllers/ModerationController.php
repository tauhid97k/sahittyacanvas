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

        // Pending posts (moderation_status = pending)
        $pendingPosts = Post::query()
            ->select([
                'id', 'user_id', 'author_id', 'title_bn', 'title_en', 'slug',
                'excerpt', 'status', 'moderation_status', 'moderated_at', 'created_at',
            ])
            ->with([
                'user:id,name,email',
                'author:id,name_bn,name_en',
                'categories:id,name_bn,name_en',
            ])
            ->where('moderation_status', 'pending')
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
            ->where('moderation_status', 'pending')
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
                'posts' => Post::where('moderation_status', 'pending')->count(),
                'comments' => Comment::where('moderation_status', 'pending')->count(),
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
            'moderation_status' => 'approved',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Post approved and published successfully.');
    }

    /**
     * Reject a post.
     */
    public function rejectPost(Request $request, Post $post): RedirectResponse
    {
        $post->update([
            'moderation_status' => 'rejected',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Post rejected.');
    }

    /**
     * Approve a comment.
     */
    public function approveComment(Request $request, Comment $comment): RedirectResponse
    {
        $comment->update([
            'moderation_status' => 'approved',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Comment approved successfully.');
    }

    /**
     * Reject a comment.
     */
    public function rejectComment(Request $request, Comment $comment): RedirectResponse
    {
        $comment->update([
            'moderation_status' => 'rejected',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Comment rejected.');
    }

    /**
     * Update moderation settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'key' => 'required|string|in:posts_require_approval,comments_require_approval,products_require_approval',
            'value' => 'required|boolean',
        ]);

        ModerationSetting::setValue($request->key, $request->value);

        return back();
    }
}
