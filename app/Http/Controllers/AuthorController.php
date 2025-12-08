<?php

namespace App\Http\Controllers;

use App\Http\Requests\Author\StoreAuthorRequest;
use App\Http\Requests\Author\UpdateAuthorRequest;
use App\Models\Author;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthorController extends Controller
{
    /**
     * Display a listing of authors.
     */
    public function index(Request $request): Response
    {
        $authors = Author::query()
            ->select(['id', 'name_bn', 'name_en', 'slug', 'nationality', 'is_active', 'created_at'])
            ->with('media')
            ->withCount('posts')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name_bn', 'like', "%{$search}%")
                      ->orWhere('name_en', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->get('status') === 'active');
            })
            ->orderBy('name_bn')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Add avatar URL to each author
        $authors->through(function ($author) {
            $author->avatar_url = $author->getFirstMediaUrl('avatar') ?: null;
            return $author;
        });

        return Inertia::render('dashboard/authors/index', [
            'authors' => $authors,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new author.
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/authors/create');
    }

    /**
     * Show the form for editing the specified author.
     */
    public function edit(Author $author): Response
    {
        $author->load('media');
        $author->avatar_url = $author->getFirstMediaUrl('avatar') ?: null;

        return Inertia::render('dashboard/authors/edit', [
            'author' => $author,
        ]);
    }

    /**
     * Store a newly created author.
     */
    public function store(StoreAuthorRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Remove avatar from validated data (handled separately)
        $avatar = $validated['avatar'] ?? null;
        unset($validated['avatar']);

        // Generate slug from name_en
        $validated['slug'] = Str::slug($validated['name_en']);

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Author::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        $author = Author::create($validated);

        // Handle avatar upload
        if ($avatar) {
            $author->addMedia($avatar)->toMediaCollection('avatar');
        }

        return redirect()->route('authors.index')->with('success', 'Author created successfully.');
    }

    /**
     * Update the specified author.
     */
    public function update(UpdateAuthorRequest $request, Author $author): RedirectResponse
    {
        $validated = $request->validated();

        // Remove avatar fields from validated data (handled separately)
        $avatar = $validated['avatar'] ?? null;
        $removeAvatar = $validated['remove_avatar'] ?? false;
        unset($validated['avatar'], $validated['remove_avatar']);

        // Regenerate slug if name_en changed
        if ($validated['name_en'] !== $author->name_en) {
            $validated['slug'] = Str::slug($validated['name_en']);

            // Ensure unique slug (excluding current)
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Author::where('slug', $validated['slug'])->where('id', '!=', $author->id)->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter++;
            }
        }

        $author->update($validated);

        // Handle avatar: upload new or remove existing
        if ($avatar) {
            $author->addMedia($avatar)->toMediaCollection('avatar');
        } elseif ($removeAvatar) {
            $author->clearMediaCollection('avatar');
        }

        return back()->with('success', 'Author updated successfully.');
    }

    /**
     * Remove the specified author.
     */
    public function destroy(Author $author): RedirectResponse
    {
        // Check if author has posts
        if ($author->posts()->exists()) {
            return back()->withErrors(['delete' => 'Cannot delete author with posts.']);
        }

        $author->delete();

        return back()->with('success', 'Author deleted successfully.');
    }
}
