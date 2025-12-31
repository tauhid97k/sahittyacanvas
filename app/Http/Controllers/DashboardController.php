<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Comment;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $roles = $user->roles()->pluck('name')->toArray();

        $isSuper = in_array(Role::SUPER->value, $roles);
        $isAdmin = in_array(Role::ADMIN->value, $roles);
        $isSeller = in_array(Role::SELLER->value, $roles);
        $isAuthor = in_array(Role::AUTHOR->value, $roles);
        $isModerator = in_array(Role::MODERATOR->value, $roles);

        $data = [
            'roles' => $roles,
            'isSuper' => $isSuper,
            'isAdmin' => $isAdmin,
            'isSeller' => $isSeller,
            'isAuthor' => $isAuthor,
            'isModerator' => $isModerator,
        ];

        // Platform stats (SUPER/ADMIN only)
        if ($isSuper || $isAdmin) {
            $data['platformStats'] = $this->getPlatformStats();
        }

        // Blog stats (SUPER/ADMIN see all, AUTHOR sees own)
        if ($isSuper || $isAdmin || $isAuthor) {
            $data['blogStats'] = $this->getBlogStats($isSuper || $isAdmin ? null : $user->id);
        }

        // Ecommerce stats (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['ecommerceStats'] = $this->getEcommerceStats($isSuper || $isAdmin ? null : $user->id);
        }

        // Moderation stats (SUPER/ADMIN/MODERATOR)
        if ($isSuper || $isAdmin || $isModerator) {
            $data['moderationStats'] = $this->getModerationStats();
        }

        // Revenue chart data (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['revenueChart'] = $this->getRevenueChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Orders chart data (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['ordersChart'] = $this->getOrdersChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Post views chart data (SUPER/ADMIN see all, AUTHOR sees own)
        if ($isSuper || $isAdmin || $isAuthor) {
            $data['postViewsChart'] = $this->getPostViewsChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent orders (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['recentOrders'] = $this->getRecentOrders($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent posts (SUPER/ADMIN see all, AUTHOR sees own)
        if ($isSuper || $isAdmin || $isAuthor) {
            $data['recentPosts'] = $this->getRecentPosts($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent reviews (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['recentReviews'] = $this->getRecentReviews($isSuper || $isAdmin ? null : $user->id);
        }

        return Inertia::render('dashboard/index', $data);
    }

    private function getPlatformStats(): array
    {
        return [
            'totalUsers' => User::count(),
            'totalPosts' => Post::count(),
            'totalProducts' => Product::count(),
            'totalOrders' => Order::count(),
            'newUsersToday' => User::whereDate('created_at', Carbon::today())->count(),
            'newUsersThisWeek' => User::whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()])->count(),
        ];
    }

    private function getBlogStats(?int $userId): array
    {
        $postsQuery = Post::query();
        $commentsQuery = Comment::query();

        if ($userId) {
            $postsQuery->where('user_id', $userId);
            $commentsQuery->whereHas('post', fn($q) => $q->where('user_id', $userId));
        }

        $totalPosts = (clone $postsQuery)->count();
        $publishedPosts = (clone $postsQuery)->where('status', 'published')->count();
        $draftPosts = (clone $postsQuery)->where('status', 'draft')->count();
        $totalViews = 0; // Views tracked by Laravisit package
        $totalComments = $commentsQuery->count();

        return [
            'totalPosts' => $totalPosts,
            'publishedPosts' => $publishedPosts,
            'draftPosts' => $draftPosts,
            'totalViews' => (int) $totalViews,
            'totalComments' => $totalComments,
        ];
    }

    private function getEcommerceStats(?int $userId): array
    {
        $productsQuery = Product::query();
        $ordersQuery = Order::query();
        $transactionsQuery = Transaction::query();

        if ($userId) {
            $productsQuery->where('user_id', $userId);
            $ordersQuery->where('seller_id', $userId);
            $transactionsQuery->where('payee_id', $userId);
        }

        $totalProducts = (clone $productsQuery)->count();
        $activeProducts = (clone $productsQuery)->where('status', 'active')->count();
        $totalOrders = (clone $ordersQuery)->count();
        $pendingOrders = (clone $ordersQuery)->where('status', 'pending')->count();
        $completedOrders = (clone $ordersQuery)->where('status', 'delivered')->count();

        // Revenue calculations (in paisa, convert to taka)
        $todayRevenue = (clone $transactionsQuery)
            ->where('status', 'paid')
            ->whereDate('paid_at', Carbon::today())
            ->sum('amount') / 100;

        $weekRevenue = (clone $transactionsQuery)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [Carbon::now()->startOfWeek(), Carbon::now()])
            ->sum('amount') / 100;

        $monthRevenue = (clone $transactionsQuery)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [Carbon::now()->startOfMonth(), Carbon::now()])
            ->sum('amount') / 100;

        $totalRevenue = (clone $transactionsQuery)
            ->where('status', 'paid')
            ->sum('amount') / 100;

        return [
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalOrders' => $totalOrders,
            'pendingOrders' => $pendingOrders,
            'completedOrders' => $completedOrders,
            'todayRevenue' => $todayRevenue,
            'weekRevenue' => $weekRevenue,
            'monthRevenue' => $monthRevenue,
            'totalRevenue' => $totalRevenue,
        ];
    }

    private function getModerationStats(): array
    {
        return [
            'pendingPosts' => Post::where('moderation_status', 'pending')->count(),
            'pendingComments' => Comment::where('moderation_status', 'pending')->count(),
            'pendingProducts' => Product::where('moderation_status', 'pending')->count(),
        ];
    }

    private function getRevenueChartData(?int $userId): array
    {
        $query = Transaction::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [Carbon::now()->subDays(30), Carbon::now()]);

        if ($userId) {
            $query->where('payee_id', $userId);
        }

        $data = $query
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'revenue' => isset($data[$date]) ? round($data[$date]->total / 100, 2) : 0,
            ];
        }

        return $chartData;
    }

    private function getOrdersChartData(?int $userId): array
    {
        $query = Order::query();

        if ($userId) {
            $query->where('seller_id', $userId);
        }

        $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $chartData = [];

        foreach ($statuses as $status) {
            $chartData[] = [
                'status' => ucfirst($status),
                'count' => (clone $query)->where('status', $status)->count(),
            ];
        }

        return $chartData;
    }

    private function getPostViewsChartData(?int $userId): array
    {
        // Posts don't have views_count column - views are tracked by Laravisit package
        // Return posts created per day instead
        $query = Post::query()
            ->where('status', 'published')
            ->whereBetween('created_at', [Carbon::now()->subDays(30), Carbon::now()]);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $data = $query
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'posts' => isset($data[$date]) ? (int) $data[$date]->count : 0,
            ];
        }

        return $chartData;
    }

    private function getRecentOrders(?int $userId, int $limit = 5): array
    {
        $query = Order::query()
            ->with(['user:id,name,email,avatar'])
            ->select(['id', 'order_number', 'user_id', 'total', 'status', 'payment_status', 'created_at']);

        if ($userId) {
            $query->where('seller_id', $userId);
        }

        return $query
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->user?->name ?? 'Guest',
                'customer_avatar' => $order->user?->avatar,
                'total' => $order->formatted_total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->diffForHumans(),
            ])
            ->toArray();
    }

    private function getRecentPosts(?int $userId, int $limit = 5): array
    {
        $query = Post::query()
            ->with(['user:id,name,email,avatar'])
            ->select(['id', 'user_id', 'title_bn', 'title_en', 'slug', 'status', 'created_at']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title_en ?? $post->title_bn,
                'slug' => $post->slug,
                'author' => $post->user?->name ?? 'Unknown',
                'author_avatar' => $post->user?->avatar,
                'status' => $post->status,
                'views' => 0, // Views tracked by Laravisit
                'created_at' => $post->created_at->diffForHumans(),
            ])
            ->toArray();
    }

    private function getRecentReviews(?int $userId, int $limit = 5): array
    {
        $query = ProductReview::query()
            ->with(['user:id,name,avatar', 'product:id,name_bn,name_en,slug']);

        if ($userId) {
            $query->whereHas('product', fn($q) => $q->where('user_id', $userId));
        }

        return $query
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'user' => $review->user?->name ?? 'Anonymous',
                'user_avatar' => $review->user?->avatar,
                'product' => $review->product?->name_en ?? $review->product?->name_bn,
                'product_slug' => $review->product?->slug,
                'created_at' => $review->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
