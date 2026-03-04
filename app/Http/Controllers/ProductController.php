<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Enums\Role;
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
        // Check permission
        if ($request->user()->cannot(Permission::LIST_PRODUCT->value)) {
            abort(403);
        }

        $user = $request->user();
        $scope = $request->get('scope', 'all');
        
        // Check if user can view all products (Super Admin / Admin)
        $canViewAll = $user->hasRole([Role::SUPER->value, Role::ADMIN->value]);

        $products = Product::query()
            ->select([
                'id', 'user_id', 'name_bn', 'name_en', 'slug', 'price', 'discount_type', 'discount_value',
                'stock_count', 'stock_alert_threshold', 'status', 'moderation_status', 'published_at', 'sales_count',
                'views_count', 'created_at'
            ])
            ->with(['media', 'categories:id,name_bn,name_en,slug', 'seller:id,name'])
            // Ownership filtering: Regular sellers see only their own, Super Admin sees all or filter
            ->when(!$canViewAll || $scope === 'mine', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
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
            $product->formatted_price = $product->formatted_price;
            $product->formatted_discounted_price = $product->formatted_discounted_price;
            $product->discount_percentage = $product->discount_percentage;
            $product->average_rating = $product->average_rating;
            $product->review_count = $product->review_count;
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
                'scope' => $scope,
            ],
            'canViewAll' => $canViewAll,
            'can' => [
                'create_product' => $request->user()->can(Permission::CREATE_PRODUCT->value),
                'edit_product' => $request->user()->can(Permission::EDIT_PRODUCT->value),
                'delete_product' => $request->user()->can(Permission::DELETE_PRODUCT->value),
                'approve_product' => $request->user()->can(Permission::APPROVE_PRODUCT->value),
                'reject_product' => $request->user()->can(Permission::REJECT_PRODUCT->value),
            ],
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::CREATE_PRODUCT->value)) {
            abort(403);
        }

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
        // Check permission
        if ($request->user()->cannot(Permission::CREATE_PRODUCT->value)) {
            abort(403);
        }

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
            'discount_type' => $validated['discount_type'] ?? null,
            'discount_value' => $this->calculateDiscountValue($validated),
            'stock_count' => $validated['stock_count'],
            'stock_alert_threshold' => $validated['stock_alert_threshold'] ?? 5,
            'sku' => $validated['sku'] ?? null,
            'status' => $validated['status'],
            'moderation_status' => $moderationStatus,
            'published_at' => $publishedAt,
        ]);

        // Sync categories
        if (!empty($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        // Handle images upload - first image is featured, rest are gallery
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            foreach ($images as $index => $image) {
                if ($index === 0) {
                    // First image goes to featured collection
                    $product->addMedia($image)
                        ->toMediaCollection('featured');
                } else {
                    // Rest go to images collection
                    $product->addMedia($image)
                        ->toMediaCollection('images');
                }
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
    public function show(Request $request, Product $product): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::VIEW_PRODUCT->value)) {
            abort(403);
        }

        // Ensure user owns this product (admin/super can view all)
        $canViewAll = $request->user()->hasRole(Role::SUPER->value) || $request->user()->hasRole(Role::ADMIN->value);
        if (!$canViewAll && $product->user_id !== $request->user()->id) {
            abort(403);
        }

        $product->load(['categories:id,name_bn,name_en,slug', 'media', 'moderator:id,name', 'seller:id,name,username,avatar', 'seller.roles:id,name']);
        
        // Calculate total revenue from order items
        $totalRevenue = $product->orderItems()->sum('total');
        
        $product->featured_image_url = $product->featured_image_url;
        $product->image_urls = $product->image_urls;
        $product->price_in_taka = $product->price_in_taka;
        $product->discount_value_in_taka = $product->discount_value_in_taka;
        $product->formatted_price = $product->formatted_price;
        $product->formatted_discounted_price = $product->formatted_discounted_price;
        $product->formatted_discount_amount = $product->formatted_discount_amount;
        $product->discount_percentage = $product->discount_percentage;
        $product->total_revenue = $totalRevenue;
        $product->formatted_total_revenue = '৳' . number_format($totalRevenue / 100, 2);
        $product->average_rating = $product->average_rating;
        $product->review_count = $product->review_count;
        $product->rating_distribution = $product->rating_distribution;

        // Get paginated reviews
        $reviews = $product->reviews()
            ->with(['user:id,name,username,avatar', 'user.roles:id,name'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('dashboard/products/show', [
            'product' => $product,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Request $request, Product $product): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::EDIT_PRODUCT->value)) {
            abort(403);
        }

        // Ensure user owns this product (admin/super can edit all)
        $canEditAll = $request->user()->hasRole(Role::SUPER->value) || $request->user()->hasRole(Role::ADMIN->value);
        if (!$canEditAll && $product->user_id !== $request->user()->id) {
            abort(403);
        }

        $product->load(['categories:id,name_bn,name_en', 'media']);
        $product->featured_image_url = $product->featured_image_url;
        $product->image_urls = $product->image_urls;
        $product->price_in_taka = $product->price_in_taka;
        $product->discount_value_in_taka = $product->discount_value_in_taka;
        $product->formatted_discounted_price = $product->formatted_discounted_price;
        $product->discount_percentage = $product->discount_percentage;
        $product->category_ids = $product->categories->pluck('id')->toArray();

        // Get all images with IDs for removal
        $product->gallery_images = $product->getMedia('images')->map(fn($media) => [
            'id' => $media->id,
            'url' => $media->getUrl(),
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
        // Check permission
        if ($request->user()->cannot(Permission::EDIT_PRODUCT->value)) {
            abort(403);
        }

        // Ensure user owns this product (admin/super can update all)
        $canEditAll = $request->user()->hasRole(Role::SUPER->value) || $request->user()->hasRole(Role::ADMIN->value);
        if (!$canEditAll && $product->user_id !== $request->user()->id) {
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
            'discount_type' => $validated['discount_type'] ?? null,
            'discount_value' => $this->calculateDiscountValue($validated),
            'stock_count' => $validated['stock_count'],
            'stock_alert_threshold' => $validated['stock_alert_threshold'] ?? 5,
            'sku' => $validated['sku'] ?? null,
            'status' => $validated['status'],
            'moderation_status' => $moderationStatus,
            'published_at' => $publishedAt,
        ]);

        // Sync categories
        if (!empty($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        // Handle featured image removal
        if ($validated['remove_featured_image'] ?? false) {
            $product->clearMediaCollection('featured');
        }

        // Remove specified gallery images by index
        if (!empty($validated['removed_images'])) {
            $allMedia = $product->getMedia('images');
            foreach ($validated['removed_images'] as $index) {
                if (isset($allMedia[$index])) {
                    $allMedia[$index]->delete();
                }
            }
        }

        // Handle new images upload - first image is featured if no existing featured
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            $hasFeatured = $product->getFirstMedia('featured') !== null;
            
            foreach ($images as $index => $image) {
                if ($index === 0 && !$hasFeatured) {
                    // First new image becomes featured if none exists
                    $product->clearMediaCollection('featured');
                    $product->addMedia($image)
                        ->toMediaCollection('featured');
                } else {
                    $product->addMedia($image)
                        ->toMediaCollection('images');
                }
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
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::DELETE_PRODUCT->value)) {
            abort(403);
        }

        // Ensure user owns this product (admin/super can delete all)
        $canDeleteAll = $request->user()->hasRole(Role::SUPER->value) || $request->user()->hasRole(Role::ADMIN->value);
        if (!$canDeleteAll && $product->user_id !== $request->user()->id) {
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

    /**
     * Calculate discount value based on type.
     * For percentage: store as-is (0-100)
     * For flat: convert to paisa
     */
    private function calculateDiscountValue(array $validated): ?int
    {
        if (empty($validated['discount_type']) || empty($validated['discount_value'])) {
            return null;
        }

        if ($validated['discount_type'] === 'percentage') {
            return (int) $validated['discount_value'];
        }

        // Flat discount - convert to paisa
        return (int) round($validated['discount_value'] * 100);
    }
}
