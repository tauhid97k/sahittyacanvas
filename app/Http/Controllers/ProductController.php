<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\ModerationSetting;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products for the seller.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $products = Product::query()
            ->select([
                'id', 'user_id', 'name_bn', 'name_en', 'slug', 'price', 'compare_price',
                'stock_count', 'status', 'moderation_status', 'published_at', 'sales_count',
                'views_count', 'created_at'
            ])
            ->with(['media', 'categories:id,name_bn,name_en,slug'])
            ->where('user_id', $user->id)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name_bn', 'like', "%{$search}%")
                      ->orWhere('name_en', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->when($request->filled('moderation'), function ($query) use ($request) {
                $query->where('moderation_status', $request->get('moderation'));
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('product_categories.id', $request->get('category'));
                });
            })
            ->when($request->filled('stock'), function ($query) use ($request) {
                match ($request->get('stock')) {
                    'in_stock' => $query->inStock(),
                    'low_stock' => $query->lowStock(),
                    'out_of_stock' => $query->outOfStock(),
                    default => null,
                };
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform products with computed attributes
        $products->through(function ($product) {
            $product->featured_image_url = $product->featured_image_url;
            $product->price_in_taka = $product->price_in_taka;
            $product->compare_price_in_taka = $product->compare_price_in_taka;
            $product->formatted_price = $product->formatted_price;
            return $product;
        });

        $categories = ProductCategory::query()
            ->select('id', 'name_bn', 'name_en')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'moderation' => $request->get('moderation', ''),
                'category' => $request->get('category', ''),
                'stock' => $request->get('stock', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = ProductCategory::query()
            ->select('id', 'name_bn', 'name_en', 'parent_id')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Generate unique slug
        $slug = Str::slug($validated['name_bn']);
        $originalSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        // Determine moderation status
        $moderationStatus = 'auto';
        $publishedAt = null;

        if ($validated['status'] === 'published') {
            if (ModerationSetting::productsRequireApproval()) {
                $moderationStatus = 'pending';
            }
            $publishedAt = now();
        }

        $product = Product::create([
            'user_id' => $user->id,
            'name_bn' => $validated['name_bn'],
            'name_en' => $validated['name_en'] ?? null,
            'slug' => $slug,
            'description' => $validated['description'],
            'price' => (int) round($validated['price'] * 100), // Convert to cents
            'compare_price' => isset($validated['compare_price']) ? (int) round($validated['compare_price'] * 100) : null,
            'stock_count' => $validated['stock_count'],
            'stock_alert_threshold' => $validated['stock_alert_threshold'] ?? 5,
            'sku' => $validated['sku'] ?? null,
            'status' => $validated['status'],
            'moderation_status' => $moderationStatus,
            'published_at' => $publishedAt,
        ]);

        // Sync categories
        $product->categories()->sync($validated['categories']);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $product->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured');
        }

        // Handle gallery images upload
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)
                    ->toMediaCollection('images');
            }
        }

        $message = $moderationStatus === 'pending'
            ? 'পণ্য সফলভাবে তৈরি হয়েছে এবং অনুমোদনের জন্য অপেক্ষমান।'
            : 'পণ্য সফলভাবে তৈরি হয়েছে।';

        return redirect()
            ->route('products.index')
            ->with('success', $message);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        // Ensure user owns this product
        if ($product->user_id !== auth()->id()) {
            abort(403);
        }

        $product->load(['categories:id,name_bn,name_en,slug', 'media', 'moderator:id,name']);
        $product->featured_image_url = $product->featured_image_url;
        $product->image_urls = $product->image_urls;
        $product->price_in_taka = $product->price_in_taka;
        $product->compare_price_in_taka = $product->compare_price_in_taka;

        return Inertia::render('dashboard/products/show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        // Ensure user owns this product
        if ($product->user_id !== auth()->id()) {
            abort(403);
        }

        $product->load(['categories:id,name_bn,name_en', 'media']);
        $product->featured_image_url = $product->featured_image_url;
        $product->image_urls = $product->image_urls;
        $product->price_in_taka = $product->price_in_taka;
        $product->compare_price_in_taka = $product->compare_price_in_taka;
        $product->category_ids = $product->categories->pluck('id')->toArray();

        // Get all images with IDs for removal
        $product->gallery_images = $product->getMedia('images')->map(fn($media) => [
            'id' => $media->id,
            'url' => $media->getUrl('medium'),
        ])->toArray();

        $categories = ProductCategory::query()
            ->select('id', 'name_bn', 'name_en', 'parent_id')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('dashboard/products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        // Ensure user owns this product
        if ($product->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validated();

        // Generate unique slug if name changed
        if ($validated['name_bn'] !== $product->name_bn) {
            $slug = Str::slug($validated['name_bn']);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
        } else {
            $slug = $product->slug;
        }

        // Determine moderation status on republish
        $moderationStatus = $product->moderation_status;
        $publishedAt = $product->published_at;

        // If publishing and moderation is required, reset to pending
        if ($validated['status'] === 'published' && $product->status !== 'published') {
            if (ModerationSetting::productsRequireApproval()) {
                $moderationStatus = 'pending';
            }
            $publishedAt = now();
        }

        // If editing a published product and moderation is on, reset to pending
        if ($product->status === 'published' && $validated['status'] === 'published') {
            if (ModerationSetting::productsRequireApproval() && $product->moderation_status !== 'pending') {
                $moderationStatus = 'pending';
            }
        }

        $product->update([
            'name_bn' => $validated['name_bn'],
            'name_en' => $validated['name_en'] ?? null,
            'slug' => $slug,
            'description' => $validated['description'],
            'price' => (int) round($validated['price'] * 100), // Convert to cents
            'compare_price' => isset($validated['compare_price']) ? (int) round($validated['compare_price'] * 100) : null,
            'stock_count' => $validated['stock_count'],
            'stock_alert_threshold' => $validated['stock_alert_threshold'] ?? 5,
            'sku' => $validated['sku'] ?? null,
            'status' => $validated['status'],
            'moderation_status' => $moderationStatus,
            'published_at' => $publishedAt,
        ]);

        // Sync categories
        $product->categories()->sync($validated['categories']);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $product->clearMediaCollection('featured');
            $product->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured');
        }

        // Remove specified images
        if (!empty($validated['remove_images'])) {
            foreach ($validated['remove_images'] as $mediaId) {
                $media = $product->getMedia('images')->where('id', $mediaId)->first();
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Handle new gallery images upload
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)
                    ->toMediaCollection('images');
            }
        }

        $message = $moderationStatus === 'pending'
            ? 'পণ্য সফলভাবে আপডেট হয়েছে এবং অনুমোদনের জন্য অপেক্ষমান।'
            : 'পণ্য সফলভাবে আপডেট হয়েছে।';

        return redirect()
            ->route('products.index')
            ->with('success', $message);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Ensure user owns this product
        if ($product->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if product has orders
        if ($product->orderItems()->exists()) {
            // Soft delete instead
            $product->delete();
            return redirect()
                ->route('products.index')
                ->with('success', 'পণ্যটি আর্কাইভ করা হয়েছে (অর্ডার ইতিহাস সংরক্ষিত)।');
        }

        // Hard delete if no orders
        $product->clearMediaCollection('featured');
        $product->clearMediaCollection('images');
        $product->categories()->detach();
        $product->forceDelete();

        return redirect()
            ->route('products.index')
            ->with('success', 'পণ্য সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
