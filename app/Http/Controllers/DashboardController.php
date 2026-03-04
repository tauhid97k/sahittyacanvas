<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\Follow;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wishlist;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

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
        $isEditor = in_array(Role::EDITOR->value, $roles);
        $isModerator = in_array(Role::MODERATOR->value, $roles);
        $isUser = in_array(Role::USER->value, $roles);

        $data = [
            'roles' => $roles,
            'isSuper' => $isSuper,
            'isAdmin' => $isAdmin,
            'isSeller' => $isSeller,
            'isAuthor' => $isAuthor,
            'isEditor' => $isEditor,
            'isModerator' => $isModerator,
            'isUser' => $isUser,
        ];

        // Platform stats (SUPER/ADMIN only)
        if ($isSuper || $isAdmin) {
            $data['platformStats'] = $this->getPlatformStats();
            $data['userGrowthChart'] = $this->getUserGrowthChartData();
        }

        // Blog stats (SUPER/ADMIN see all, AUTHOR/EDITOR sees own)
        if ($isSuper || $isAdmin || $isAuthor || $isEditor) {
            $data['blogStats'] = $this->getBlogStats($isSuper || $isAdmin ? null : $user->id);
            $data['topPosts'] = $this->getTopPosts($isSuper || $isAdmin ? null : $user->id);
        }

        // Ecommerce stats (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['ecommerceStats'] = $this->getEcommerceStats($isSuper || $isAdmin ? null : $user->id);
            $data['topProducts'] = $this->getTopProducts($isSuper || $isAdmin ? null : $user->id);
            $data['lowStockProducts'] = $this->getLowStockProducts($isSuper || $isAdmin ? null : $user->id);
        }

        // Moderation stats (SUPER/ADMIN/MODERATOR)
        if ($isSuper || $isAdmin || $isModerator) {
            $data['moderationStats'] = $this->getModerationStats();
            $data['moderationActivityChart'] = $this->getModerationActivityChartData();
        }

        // Revenue chart data (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['revenueChart'] = $this->getRevenueChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Orders chart data (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['ordersChart'] = $this->getOrdersChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Post activity chart data (SUPER/ADMIN see all, AUTHOR/EDITOR sees own)
        if ($isSuper || $isAdmin || $isAuthor || $isEditor) {
            $data['postViewsChart'] = $this->getPostViewsChartData($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent orders (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['recentOrders'] = $this->getRecentOrders($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent posts (SUPER/ADMIN see all, AUTHOR/EDITOR sees own)
        if ($isSuper || $isAdmin || $isAuthor || $isEditor) {
            $data['recentPosts'] = $this->getRecentPosts($isSuper || $isAdmin ? null : $user->id);
        }

        // Recent reviews (SUPER/ADMIN see all, SELLER sees own)
        if ($isSuper || $isAdmin || $isSeller) {
            $data['recentReviews'] = $this->getRecentReviews($isSuper || $isAdmin ? null : $user->id);
        }

        // Author follower stats
        if ($isAuthor || $isEditor) {
            $data['authorStats'] = $this->getAuthorStats($user->id);
        }

        // USER dashboard (own orders, bookmarks, wishlist, etc.)
        if ($isUser && !$isSuper && !$isAdmin && !$isSeller && !$isAuthor && !$isEditor && !$isModerator) {
            $data['userStats'] = $this->getUserStats($user);
            $data['userRecentOrders'] = $this->getUserRecentOrders($user->id);
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
        $totalViews = (clone $postsQuery)->withTotalVisitCount()->get()->sum('visit_count_total');
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
        $activeProducts = (clone $productsQuery)->where('status', 'published')->count();
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
        // Get posts created per day for the last 30 days
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
            ->withTotalVisitCount()
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
                'views' => (int) ($post->visit_count_total ?? 0),
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

    // ==================== NEW DASHBOARD METHODS ====================

    private function getUserGrowthChartData(): array
    {
        $data = User::query()
            ->whereBetween('created_at', [Carbon::now()->subDays(30), Carbon::now()])
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
                'users' => isset($data[$date]) ? (int) $data[$date]->count : 0,
            ];
        }

        return $chartData;
    }

    private function getTopPosts(?int $userId, int $limit = 5): array
    {
        $query = Post::query()
            ->with(['user:id,name,avatar'])
            ->withTotalVisitCount()
            ->where('status', 'published')
            ->select(['id', 'user_id', 'title_bn', 'title_en', 'slug', 'likes_count', 'comments_count', 'created_at']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query
            ->orderByDesc('visit_count_total')
            ->take($limit)
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title_en ?? $post->title_bn,
                'slug' => $post->slug,
                'author' => $post->user?->name ?? 'Unknown',
                'author_avatar' => $post->user?->avatar,
                'views' => (int) ($post->visit_count_total ?? 0),
                'likes' => $post->likes_count ?? 0,
                'comments' => $post->comments_count ?? 0,
            ])
            ->toArray();
    }

    private function getTopProducts(?int $userId, int $limit = 5): array
    {
        $query = Product::query()
            ->with(['seller:id,name'])
            ->where('status', 'published')
            ->select(['id', 'user_id', 'name_bn', 'name_en', 'slug', 'price', 'sales_count', 'views_count']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query
            ->orderByDesc('sales_count')
            ->take($limit)
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name_en ?? $product->name_bn,
                'slug' => $product->slug,
                'seller' => $product->seller?->name ?? 'Unknown',
                'price' => $product->formatted_price,
                'sales' => $product->sales_count,
                'views' => $product->views_count,
            ])
            ->toArray();
    }

    private function getLowStockProducts(?int $userId, int $limit = 5): array
    {
        $query = Product::query()
            ->where('status', 'published')
            ->where('stock_count', '<=', DB::raw('stock_alert_threshold'))
            ->select(['id', 'user_id', 'name_bn', 'name_en', 'slug', 'stock_count', 'stock_alert_threshold']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query
            ->orderBy('stock_count')
            ->take($limit)
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name_en ?? $product->name_bn,
                'slug' => $product->slug,
                'stock' => $product->stock_count,
                'threshold' => $product->stock_alert_threshold,
                'isOutOfStock' => $product->stock_count === 0,
            ])
            ->toArray();
    }

    private function getModerationActivityChartData(): array
    {
        // Count approved + rejected items per day over last 14 days
        $days = 14;

        $postsApproved = Post::query()
            ->whereIn('moderation_status', ['approved'])
            ->whereNotNull('moderated_at')
            ->whereBetween('moderated_at', [Carbon::now()->subDays($days), Carbon::now()])
            ->select(DB::raw('DATE(moderated_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $postsRejected = Post::query()
            ->where('moderation_status', 'rejected')
            ->whereNotNull('moderated_at')
            ->whereBetween('moderated_at', [Carbon::now()->subDays($days), Carbon::now()])
            ->select(DB::raw('DATE(moderated_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'approved' => isset($postsApproved[$date]) ? (int) $postsApproved[$date]->count : 0,
                'rejected' => isset($postsRejected[$date]) ? (int) $postsRejected[$date]->count : 0,
            ];
        }

        return $chartData;
    }

    private function getAuthorStats(int $userId): array
    {
        $followerCount = Follow::where('followable_type', User::class)
            ->where('followable_id', $userId)
            ->count();

        $newFollowersThisWeek = Follow::where('followable_type', User::class)
            ->where('followable_id', $userId)
            ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()])
            ->count();

        $totalLikes = Post::where('user_id', $userId)->sum('likes_count');
        $totalBookmarks = Post::where('user_id', $userId)->sum('bookmarks_count');

        return [
            'followers' => $followerCount,
            'newFollowersThisWeek' => $newFollowersThisWeek,
            'totalLikes' => (int) $totalLikes,
            'totalBookmarks' => (int) $totalBookmarks,
        ];
    }

    private function getUserStats(User $user): array
    {
        $totalOrders = Order::where('user_id', $user->id)->count();
        $pendingOrders = Order::where('user_id', $user->id)->where('status', 'pending')->count();
        $deliveredOrders = Order::where('user_id', $user->id)->where('status', 'delivered')->count();
        $wishlistCount = Wishlist::where('user_id', $user->id)->count();
        $bookmarkCount = Bookmark::where('user_id', $user->id)->count();
        $followingCount = Follow::where('follower_id', $user->id)->count();

        return [
            'totalOrders' => $totalOrders,
            'pendingOrders' => $pendingOrders,
            'deliveredOrders' => $deliveredOrders,
            'wishlistCount' => $wishlistCount,
            'bookmarkCount' => $bookmarkCount,
            'followingCount' => $followingCount,
        ];
    }

    private function getUserRecentOrders(int $userId, int $limit = 5): array
    {
        return Order::query()
            ->with(['seller:id,name'])
            ->select(['id', 'order_number', 'seller_id', 'total', 'status', 'payment_status', 'created_at'])
            ->where('user_id', $userId)
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'seller' => $order->seller?->name ?? 'Unknown',
                'total' => $order->formatted_total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
