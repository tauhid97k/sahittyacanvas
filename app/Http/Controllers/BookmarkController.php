<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Bookmark;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $bookmarks = Bookmark::where('user_id', $request->user()->id)
            ->with(['post' => fn ($q) => $q->with(['user', 'author', 'categories', 'media'])])
            ->latest()
            ->paginate(10)
            ->through(fn ($bookmark) => [
                'id' => $bookmark->id,
                'post_id' => $bookmark->post_id,
                'post' => $bookmark->post ? [
                    'id' => $bookmark->post->id,
                    'title' => $bookmark->post->title,
                    'slug' => $bookmark->post->slug,
                    'excerpt' => $bookmark->post->excerpt,
                    'featured_image' => $bookmark->post->getFirstMediaUrl('featured', 'thumb') ?: null,
                    'author' => [
                        'id' => $bookmark->post->author?->id ?? $bookmark->post->user->id,
                        'name' => $bookmark->post->author?->name_bn ?? $bookmark->post->user->name,
                    ],
                    'categories' => $bookmark->post->categories->map(fn ($cat) => [
                        'id' => $cat->id,
                        'name' => $cat->name_bn,
                        'slug' => $cat->slug,
                    ]),
                    'published_at' => $bookmark->post->published_at?->toISOString(),
                ] : null,
                'created_at' => $bookmark->created_at->toISOString(),
            ])
            ->filter(fn ($item) => $item['post'] !== null);

        return Inertia::render('dashboard/bookmarks/index', [
            'bookmarks' => $bookmarks,
        ]);
    }

    public function destroy(Request $request, Bookmark $bookmark): RedirectResponse
    {
        if ($bookmark->user_id !== $request->user()->id) {
            abort(403);
        }

        $bookmark->delete();

        return back()->with('success', 'Bookmark removed');
    }
}
