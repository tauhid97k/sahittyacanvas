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
            ->with('parent:id,name_bn,name_en,slug')
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

        // Get all categories for parent selection (excluding current for edit)
        $allCategories = Category::query()
            ->select('id', 'name_bn', 'name_en', 'slug', 'parent_id')
            ->ordered()
            ->get();

        return Inertia::render('dashboard/categories/index', [
            'categories' => $categories,
            'allCategories' => $allCategories,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_bn']);
        }

        // Ensure unique slug
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        Category::create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_bn']);
        }

        // Ensure unique slug (excluding current)
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter++;
        }

        $category->update($validated);

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
