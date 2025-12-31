<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->approved()
            ->whereNotNull('published_at')
            ->with(['user', 'categories', 'media']);

        // Filter by category
        if ($request->filled('category')) {
            $query->whereHas('categories', fn ($q) => $q->where('slug', $request->category));
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price * 100);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price * 100);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_low' => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('sales_count'),
            'rating' => $query->withAvg('reviews', 'rating')->orderByDesc('reviews_avg_rating'),
            default => $query->latest('published_at'),
        };

        $products = $query->paginate(12)->through(fn ($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'discount_price' => $product->discount_price,
            'image' => $product->getFirstMediaUrl('images', 'medium') ?: null,
            'seller' => [
                'id' => $product->user->id,
                'name' => $product->user->name,
            ],
            'category' => $product->categories->first() ? [
                'name' => $product->categories->first()->name_bn,
                'slug' => $product->categories->first()->slug,
            ] : null,
            'rating' => (float) ($product->reviews()->avg('rating') ?? 0),
            'reviews_count' => $product->reviews()->count(),
            'in_stock' => $product->stock > 0,
        ]);

        $categories = ProductCategory::query()
            ->active()
            ->root()
            ->withCount(['products' => fn ($q) => $q->approved()->whereNotNull('published_at')])
            ->ordered()
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name_bn' => $cat->name_bn,
                'slug' => $cat->slug,
                'products_count' => $cat->products_count,
            ]);

        return Inertia::render('public/shop/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'sort' => $sort,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->approved()
            ->whereNotNull('published_at')
            ->with([
                'user',
                'categories',
                'media',
                'reviews' => fn ($q) => $q->with('user')->latest()->take(10),
            ])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->firstOrFail();

        // Increment views
        $product->increment('views_count');

        // Get related products
        $relatedProducts = Product::query()
            ->approved()
            ->whereNotNull('published_at')
            ->where('id', '!=', $product->id)
            ->whereHas('categories', fn ($q) => $q->whereIn('id', $product->categories->pluck('id')))
            ->with(['user', 'media'])
            ->take(4)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => $p->price,
                'discount_price' => $p->discount_price,
                'image' => $p->getFirstMediaUrl('images', 'medium') ?: null,
                'rating' => (float) ($p->reviews()->avg('rating') ?? 0),
            ]);

        // Breadcrumb
        $breadcrumb = [
            ['title' => 'হোম', 'href' => '/'],
            ['title' => 'কেনাকাটা', 'href' => '/shop'],
        ];

        if ($product->categories->first()) {
            $breadcrumb[] = [
                'title' => $product->categories->first()->name_bn,
                'href' => "/product-category/{$product->categories->first()->slug}",
            ];
        }

        $breadcrumb[] = ['title' => $product->name, 'href' => "/product/{$product->slug}"];

        return Inertia::render('public/shop/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'discount_price' => $product->discount_price,
                'discount_ends_at' => $product->discount_ends_at?->toISOString(),
                'stock' => $product->stock,
                'sku' => $product->sku,
                'images' => $product->getMedia('images')->map(fn ($media) => [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb' => $media->getUrl('thumb'),
                    'medium' => $media->getUrl('medium'),
                ]),
                'seller' => [
                    'id' => $product->user->id,
                    'name' => $product->user->name,
                    'avatar' => $product->user->avatar,
                    'username' => $product->user->username,
                ],
                'categories' => $product->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_bn' => $cat->name_bn,
                    'slug' => $cat->slug,
                ]),
                'rating' => round($product->reviews_avg_rating ?? 0, 1),
                'reviews_count' => $product->reviews_count,
                'reviews' => $product->reviews->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'is_verified' => $review->is_verified,
                    'user' => [
                        'id' => $review->user->id,
                        'name' => $review->user->name,
                        'avatar' => $review->user->avatar,
                    ],
                    'created_at' => $review->created_at->toISOString(),
                ]),
                'views_count' => $product->views_count,
                'sales_count' => $product->sales_count,
            ],
            'relatedProducts' => $relatedProducts,
            'breadcrumb' => $breadcrumb,
        ]);
    }

    public function category(string $slug): Response
    {
        $category = ProductCategory::where('slug', $slug)->active()->firstOrFail();

        $products = Product::query()
            ->approved()
            ->whereNotNull('published_at')
            ->whereHas('categories', fn ($q) => $q->where('id', $category->id))
            ->with(['user', 'categories', 'media'])
            ->latest('published_at')
            ->paginate(12)
            ->through(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'discount_price' => $product->discount_price,
                'image' => $product->getFirstMediaUrl('images', 'medium') ?: null,
                'seller' => [
                    'id' => $product->user->id,
                    'name' => $product->user->name,
                ],
                'rating' => (float) ($product->reviews()->avg('rating') ?? 0),
                'reviews_count' => $product->reviews()->count(),
                'in_stock' => $product->stock > 0,
            ]);

        // Get subcategories
        $subcategories = $category->children()
            ->active()
            ->withCount(['products' => fn ($q) => $q->approved()->whereNotNull('published_at')])
            ->ordered()
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name_bn' => $cat->name_bn,
                'slug' => $cat->slug,
                'products_count' => $cat->products_count,
            ]);

        // Breadcrumb
        $breadcrumb = $category->ancestorsAndSelf()
            ->get()
            ->map(fn ($cat) => [
                'title' => $cat->name_bn,
                'href' => "/product-category/{$cat->slug}",
            ])
            ->toArray();

        array_unshift($breadcrumb, ['title' => 'হোম', 'href' => '/']);
        array_unshift($breadcrumb, ['title' => 'কেনাকাটা', 'href' => '/shop']);

        return Inertia::render('public/shop/category', [
            'category' => [
                'id' => $category->id,
                'name_bn' => $category->name_bn,
                'name_en' => $category->name_en,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->getFirstMediaUrl('image', 'large') ?: null,
            ],
            'products' => $products,
            'subcategories' => $subcategories,
            'breadcrumb' => $breadcrumb,
        ]);
    }
}
