<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductCategory\StoreProductCategoryRequest;
use App\Http\Requests\ProductCategory\UpdateProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of product categories.
     */
    public function index(Request $request): Response
    {
        $categories = ProductCategory::query()
            ->select(['id', 'name_bn', 'name_en', 'slug', 'description', 'parent_id', 'is_active', 'created_at'])
            ->with(['parent:id,name_bn,name_en,slug', 'media'])
            ->withCount('products')
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

        return Inertia::render('dashboard/product-categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new product category.
     */
    public function create(): Response
    {
        $categories = ProductCategory::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/product-categories/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product category.
     */
    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Generate unique slug
        $slug = Str::slug($validated['name_bn']);
        $originalSlug = $slug;
        $counter = 1;
        while (ProductCategory::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $category = ProductCategory::create([
            'name_bn' => $validated['name_bn'],
            'name_en' => $validated['name_en'] ?? null,
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $category->addMediaFromRequest('image')
                ->toMediaCollection('image');
        }

        return redirect()
            ->route('product-categories.index')
            ->with('success', 'পণ্য ক্যাটাগরি সফলভাবে তৈরি হয়েছে।');
    }

    /**
     * Show the form for editing the specified product category.
     */
    public function edit(ProductCategory $productCategory): Response
    {
        $productCategory->load('media');
        $productCategory->image_url = $productCategory->getFirstMediaUrl('image') ?: null;

        $categories = ProductCategory::query()
            ->select('id', 'name_bn', 'name_en')
            ->where('id', '!=', $productCategory->id)
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/product-categories/edit', [
            'category' => $productCategory,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product category.
     */
    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $validated = $request->validated();

        // Generate unique slug if name changed
        if ($validated['name_bn'] !== $productCategory->name_bn) {
            $slug = Str::slug($validated['name_bn']);
            $originalSlug = $slug;
            $counter = 1;
            while (ProductCategory::where('slug', $slug)->where('id', '!=', $productCategory->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
        } else {
            $slug = $productCategory->slug;
        }

        $productCategory->update([
            'name_bn' => $validated['name_bn'],
            'name_en' => $validated['name_en'] ?? null,
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $productCategory->clearMediaCollection('image');
            $productCategory->addMediaFromRequest('image')
                ->toMediaCollection('image');
        }

        return redirect()
            ->route('product-categories.index')
            ->with('success', 'পণ্য ক্যাটাগরি সফলভাবে আপডেট হয়েছে।');
    }

    /**
     * Remove the specified product category.
     */
    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        // Check if category has products
        if ($productCategory->products()->exists()) {
            return back()->with('error', 'এই ক্যাটাগরিতে পণ্য রয়েছে। প্রথমে পণ্যগুলো সরান বা অন্য ক্যাটাগরিতে স্থানান্তর করুন।');
        }

        // Reassign children to parent
        if ($productCategory->children()->exists()) {
            $productCategory->children()->update(['parent_id' => $productCategory->parent_id]);
        }

        $productCategory->clearMediaCollection('image');
        $productCategory->delete();

        return redirect()
            ->route('product-categories.index')
            ->with('success', 'পণ্য ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
