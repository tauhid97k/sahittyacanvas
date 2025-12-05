<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->select(['id', 'name_bn', 'name_en', 'slug', 'description', 'parent_id', 'is_active', 'created_at'])
            ->with(['parent:id,name_bn,name_en,slug', 'media'])
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
            ->ordered()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Add image URL to each category
        $categories->through(function ($category) {
            $category->image_url = $category->getFirstMediaUrl('image') ?: null;
            return $category;
        });

        return Inertia::render('dashboard/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        $categories = Category::query()
            ->select('id', 'name_bn', 'name_en')
            ->ordered()
            ->get();

        return Inertia::render('dashboard/categories/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category): Response
    {
        $category->load('media');
        $category->image_url = $category->getFirstMediaUrl('image') ?: null;

        $categories = Category::query()
            ->select('id', 'name_bn', 'name_en')
            ->where('id', '!=', $category->id)
            ->ordered()
            ->get();

        return Inertia::render('dashboard/categories/edit', [
            'category' => $category,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Remove image from validated data (handled separately)
        $image = $validated['image'] ?? null;
        unset($validated['image']);

        // Generate slug from name_en
        $validated['slug'] = Str::slug($validated['name_en']);

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        $category = Category::create($validated);

        // Handle image upload
        if ($image) {
            $category->addMedia($image)->toMediaCollection('image');
        }

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();

        // Remove image fields from validated data (handled separately)
        $image = $validated['image'] ?? null;
        $removeImage = $validated['remove_image'] ?? false;
        unset($validated['image'], $validated['remove_image']);

        // Regenerate slug if name_en changed
        if ($validated['name_en'] !== $category->name_en) {
            $validated['slug'] = Str::slug($validated['name_en']);

            // Ensure unique slug (excluding current)
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter++;
            }
        }

        $category->update($validated);

        // Handle image: upload new or remove existing
        if ($image) {
            $category->addMedia($image)->toMediaCollection('image');
        } elseif ($removeImage) {
            $category->clearMediaCollection('image');
        }

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        // Check if category has posts
        if ($category->posts()->exists()) {
            return back()->with('error', 'Cannot delete category with posts.');
        }

        // Move children to parent (or make them root)
        $category->children()->update(['parent_id' => $category->parent_id]);

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
