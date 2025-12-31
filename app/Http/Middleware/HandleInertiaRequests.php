<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\ProductCategory;
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
     * Get cart item count for the current user.
     */
    protected function getCartCount(Request $request): int
    {
        if (! $request->user()) {
            return 0;
        }

        $cart = $request->user()->cart;

        return $cart ? $cart->items()->sum('quantity') : 0;
    }
}
