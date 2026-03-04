<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Enums\Role;
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
     * - SUPER/ADMIN/MODERATOR: see all comments
     * - AUTHOR/EDITOR: see only comments on their own posts
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_COMMENT->value)) {
            abort(403);
        }

        $user = $request->user();
        $isAdminOrSuper = $user->hasRole([Role::SUPER->value, Role::ADMIN->value]);
        $isModerator = $user->hasRole(Role::MODERATOR->value);

        $comments = Comment::query()
            ->with([
                'user:id,name,email,avatar',
                'post:id,title_bn,title_en,slug,user_id',
                'parent:id,content,user_id',
                'parent.user:id,name',
            ])
            ->when(!$isAdminOrSuper && !$isModerator, function ($query) use ($user) {
                // AUTHOR/EDITOR: only comments on their own posts
                $query->whereHas('post', fn($q) => $q->where('user_id', $user->id));
            })
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
                if (in_array($status, ['auto', 'pending', 'approved', 'rejected'])) {
                    $query->where('moderation_status', $status);
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
            'can' => [
                'approve_comment' => $request->user()->can(Permission::APPROVE_COMMENT->value),
                'reject_comment' => $request->user()->can(Permission::REJECT_COMMENT->value),
                'delete_comment' => $request->user()->can(Permission::DELETE_COMMENT->value),
            ],
        ]);
    }

    /**
     * Approve a comment.
     */
    public function approve(Request $request, Comment $comment): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::APPROVE_COMMENT->value)) {
            abort(403);
        }

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
    public function reject(Request $request, Comment $comment): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::REJECT_COMMENT->value)) {
            abort(403);
        }

        $comment->update([
            'moderation_status' => 'rejected',
            'moderated_at' => now(),
            'moderated_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Comment rejected successfully.');
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::DELETE_COMMENT->value)) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted successfully.');
    }
}
