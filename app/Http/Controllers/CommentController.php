<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\ModerationSetting;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request): Response
    {
        $comments = Comment::query()
            ->with([
                'user:id,name,email,avatar',
                'post:id,title_bn,title_en,slug',
                'parent:id,content,user_id',
                'parent.user:id,name',
            ])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('content', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('post', function ($postQuery) use ($search) {
                            $postQuery->where('title_bn', 'like', "%{$search}%")
                                ->orWhere('title_en', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $status = $request->get('status');
                if ($status === 'approved') {
                    $query->where('is_approved', true);
                } elseif ($status === 'pending') {
                    $query->where('is_approved', false);
                }
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('dashboard/comments/index', [
            'comments' => $comments,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
            'commentModerationEnabled' => ModerationSetting::commentsRequireApproval(),
        ]);
    }

    /**
     * Approve a comment.
     */
    public function approve(Comment $comment): RedirectResponse
    {
        $comment->update([
            'is_approved' => true,
            'moderation_status' => 'approved',
        ]);

        return back()->with('success', 'Comment approved successfully.');
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('success', 'Comment deleted successfully.');
    }
}
