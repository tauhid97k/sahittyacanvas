<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LikeController extends Controller
{
    /**
     * Display a listing of likes.
     * - SUPER/ADMIN: see all likes
     * - Other users: see only their own likes
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdminOrSuper = $user->hasRole([Role::SUPER->value, Role::ADMIN->value]);

        $likes = Like::query()
            ->with([
                'user:id,name,email,avatar',
                'post:id,title_bn,title_en,slug',
            ])
            ->when(!$isAdminOrSuper, function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('post', function ($postQuery) use ($search) {
                        $postQuery->where('title_bn', 'like', "%{$search}%")
                            ->orWhere('title_en', 'like', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('dashboard/likes/index', [
            'likes' => $likes,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    /**
     * Remove the specified like.
     */
    public function destroy(Request $request, Like $like): RedirectResponse
    {
        $user = $request->user();

        // Only allow deleting own likes (or admin/super)
        if ($like->user_id !== $user->id && !$user->hasRole([Role::SUPER->value, Role::ADMIN->value])) {
            abort(403);
        }

        $like->delete();

        return back()->with('success', 'Like removed successfully.');
    }
}
