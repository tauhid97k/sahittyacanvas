<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\ProductCategory;
use App\Models\Wishlist;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'headerNotifications' => fn () => $this->getNotifications($request),
            'blogCategories' => fn () => $this->getBlogCategories(),
            'productCategories' => fn () => $this->getProductCategories(),
            'cartCount' => fn () => $this->getCartCount($request),
            'cartItems' => fn () => $this->getCartItems($request),
            'wishlistIds' => fn () => $this->getWishlistIds($request),
            'wishlistCount' => fn () => $this->getWishlistCount($request),
            'wishlistItems' => fn () => $this->getWishlistItems($request),
        ];
    }

    /**
     * Get notifications data for the authenticated user.
     */
    protected function getNotifications(Request $request): ?array
    {
        if (! $request->user()) {
            return null;
        }

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? 'system',
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'data' => $notification->data,
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at->toISOString(),
            ]);

        return [
            'items' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ];
    }

    /**
     * Get blog categories with children for navigation.
     */
    protected function getBlogCategories(): array
    {
        return Cache::remember('public_blog_categories', 3600, function () {
            return Category::query()
                ->active()
                ->root()
                ->with(['children' => fn ($q) => $q->active()->ordered()])
                ->ordered()
                ->get()
                ->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_bn' => $cat->name_bn,
                    'name_en' => $cat->name_en,
                    'slug' => $cat->slug,
                    'children' => $cat->children->map(fn ($child) => [
                        'id' => $child->id,
                        'name_bn' => $child->name_bn,
                        'name_en' => $child->name_en,
                        'slug' => $child->slug,
                    ])->toArray(),
                ])
                ->toArray();
        });
    }

    /**
     * Get product categories with children for navigation.
     */
    protected function getProductCategories(): array
    {
        return Cache::remember('public_product_categories', 3600, function () {
            return ProductCategory::query()
                ->active()
                ->root()
                ->with(['children' => fn ($q) => $q->active()->ordered()])
                ->ordered()
                ->get()
                ->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_bn' => $cat->name_bn,
                    'name_en' => $cat->name_en,
                    'slug' => $cat->slug,
                    'children' => $cat->children->map(fn ($child) => [
                        'id' => $child->id,
                        'name_bn' => $child->name_bn,
                        'name_en' => $child->name_en,
                        'slug' => $child->slug,
                    ])->toArray(),
                ])
                ->toArray();
        });
    }

    /**
     * Get cart item count for the current user or guest.
     */
    protected function getCartCount(Request $request): int
    {
        $cart = $this->getCartForRequest($request);

        return $cart ? $cart->items()->sum('quantity') : 0;
    }

    /**
     * Get cart for current user or guest session.
     */
    protected function getCartForRequest(Request $request): ?\App\Models\Cart
    {
        if ($request->user()) {
            return $request->user()->cart;
        }

        // Guest cart via session
        $sessionId = $request->session()->getId();
        return \App\Models\Cart::where('session_id', $sessionId)->first();
    }

    /**
     * Get wishlist product IDs for the current user.
     */
    protected function getWishlistIds(Request $request): array
    {
        if (! $request->user()) {
            return [];
        }

        return Wishlist::where('user_id', $request->user()->id)
            ->pluck('product_id')
            ->toArray();
    }

    /**
     * Get wishlist count for the current user.
     */
    protected function getWishlistCount(Request $request): int
    {
        if (! $request->user()) {
            return 0;
        }

        return Wishlist::where('user_id', $request->user()->id)->count();
    }

    /**
     * Get wishlist items for the wishlist drawer.
     */
    protected function getWishlistItems(Request $request): array
    {
        if (! $request->user()) {
            return [];
        }

        return Wishlist::where('user_id', $request->user()->id)
            ->with(['product.media'])
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image' => $item->product->getFirstMediaUrl('images', 'thumb') ?: null,
                    'price' => $item->product->price,
                    'discount_price' => $item->product->discount_price,
                    'in_stock' => $item->product->stock_count > 0,
                ] : null,
            ])
            ->filter(fn ($item) => $item['product'] !== null)
            ->values()
            ->toArray();
    }

    /**
     * Get cart items grouped by seller for the cart drawer.
     */
    protected function getCartItems(Request $request): array
    {
        $cart = $this->getCartForRequest($request);

        if (! $cart) {
            return [
                'items' => [],
                'grouped' => [],
                'subtotal' => 0,
                'formatted_subtotal' => '৳0.00',
            ];
        }

        $cart->load(['items.product.user', 'items.product.media']);

        $items = $cart->items->map(fn ($item) => [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
            'unit_price' => $item->unit_price,
            'total' => $item->total,
            'product' => $item->product ? [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'image' => $item->product->getFirstMediaUrl('images', 'thumb') ?: null,
                'stock' => $item->product->stock,
                'seller' => $item->product->user ? [
                    'id' => $item->product->user->id,
                    'name' => $item->product->user->name,
                    'username' => $item->product->user->username,
                ] : null,
            ] : null,
        ])->filter(fn ($item) => $item['product'] !== null);

        // Group by seller
        $grouped = $items->groupBy('product.seller.id')->map(function ($sellerItems, $sellerId) {
            $seller = $sellerItems->first()['product']['seller'] ?? null;
            return [
                'seller' => $seller,
                'items' => $sellerItems->values()->toArray(),
                'subtotal' => $sellerItems->sum('total'),
            ];
        })->values()->toArray();

        return [
            'items' => $items->values()->toArray(),
            'grouped' => $grouped,
            'subtotal' => $cart->subtotal,
            'formatted_subtotal' => $cart->formatted_subtotal,
        ];
    }
}
