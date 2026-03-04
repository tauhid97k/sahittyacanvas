import {
    AuthorStats,
    BlogStats,
    EcommerceStats,
    LowStockAlerts,
    ModerationActivityChart,
    ModerationStats,
    OrdersChart,
    PlatformStats,
    PostViewsChart,
    RecentOrders,
    RecentPosts,
    RecentReviews,
    RevenueChart,
    TopPosts,
    TopProducts,
    UserGrowthChart,
    UserRecentOrders,
    UserStats,
} from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface DashboardProps {
    roles: string[];
    isSuper: boolean;
    isAdmin: boolean;
    isSeller: boolean;
    isAuthor: boolean;
    isEditor: boolean;
    isModerator: boolean;
    isUser: boolean;
    platformStats?: {
        totalUsers: number;
        totalPosts: number;
        totalProducts: number;
        totalOrders: number;
        newUsersToday: number;
        newUsersThisWeek: number;
    };
    blogStats?: {
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        totalViews: number;
        totalComments: number;
    };
    ecommerceStats?: {
        totalProducts: number;
        activeProducts: number;
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        totalRevenue: number;
    };
    moderationStats?: {
        pendingPosts: number;
        pendingComments: number;
        pendingProducts: number;
    };
    authorStats?: {
        followers: number;
        newFollowersThisWeek: number;
        totalLikes: number;
        totalBookmarks: number;
    };
    userStats?: {
        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        wishlistCount: number;
        bookmarkCount: number;
        followingCount: number;
    };
    revenueChart?: Array<{ date: string; revenue: number }>;
    ordersChart?: Array<{ status: string; count: number }>;
    postViewsChart?: Array<{ date: string; posts: number }>;
    userGrowthChart?: Array<{ date: string; users: number }>;
    moderationActivityChart?: Array<{
        date: string;
        approved: number;
        rejected: number;
    }>;
    recentOrders?: Array<{
        id: number;
        order_number: string;
        customer: string;
        customer_avatar: string | null;
        total: string;
        status: string;
        payment_status: string;
        created_at: string;
    }>;
    recentPosts?: Array<{
        id: number;
        title: string;
        slug: string;
        author: string;
        author_avatar: string | null;
        status: string;
        views: number;
        created_at: string;
    }>;
    recentReviews?: Array<{
        id: number;
        rating: number;
        comment: string | null;
        user: string;
        user_avatar: string | null;
        product: string;
        product_slug: string;
        created_at: string;
    }>;
    userRecentOrders?: Array<{
        id: number;
        order_number: string;
        seller: string;
        total: string;
        status: string;
        payment_status: string;
        created_at: string;
    }>;
    topProducts?: Array<{
        id: number;
        name: string;
        slug: string;
        seller: string;
        price: string;
        sales: number;
        views: number;
    }>;
    topPosts?: Array<{
        id: number;
        title: string;
        slug: string;
        author: string;
        author_avatar: string | null;
        views: number;
        likes: number;
        comments: number;
    }>;
    lowStockProducts?: Array<{
        id: number;
        name: string;
        slug: string;
        stock: number;
        threshold: number;
        isOutOfStock: boolean;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    isSuper,
    isAdmin,
    isSeller,
    isAuthor,
    isEditor,
    isModerator,
    isUser,
    platformStats,
    blogStats,
    ecommerceStats,
    moderationStats,
    authorStats,
    userStats,
    revenueChart,
    ordersChart,
    postViewsChart,
    userGrowthChart,
    moderationActivityChart,
    recentOrders,
    recentPosts,
    recentReviews,
    userRecentOrders,
    topProducts,
    topPosts,
    lowStockProducts,
}: DashboardProps) {
    const showPlatformStats = (isSuper || isAdmin) && platformStats;
    const showBlogStats =
        (isSuper || isAdmin || isAuthor || isEditor) && blogStats;
    const showEcommerceStats =
        (isSuper || isAdmin || isSeller) && ecommerceStats;
    const showModerationStats =
        (isSuper || isAdmin || isModerator) && moderationStats;
    const showAuthorStats = (isAuthor || isEditor) && authorStats;
    const showUserStats =
        isUser &&
        !isSuper &&
        !isAdmin &&
        !isSeller &&
        !isAuthor &&
        !isEditor &&
        !isModerator &&
        userStats;
    const showRevenueChart = (isSuper || isAdmin || isSeller) && revenueChart;
    const showOrdersChart = (isSuper || isAdmin || isSeller) && ordersChart;
    const showPostViewsChart =
        (isSuper || isAdmin || isAuthor || isEditor) && postViewsChart;
    const showUserGrowthChart = (isSuper || isAdmin) && userGrowthChart;
    const showModerationActivityChart =
        (isSuper || isAdmin || isModerator) && moderationActivityChart;
    const showRecentOrders = (isSuper || isAdmin || isSeller) && recentOrders;
    const showRecentPosts =
        (isSuper || isAdmin || isAuthor || isEditor) && recentPosts;
    const showRecentReviews = (isSuper || isAdmin || isSeller) && recentReviews;
    const showUserRecentOrders = showUserStats && userRecentOrders;
    const showTopProducts =
        (isSuper || isAdmin || isSeller) &&
        topProducts &&
        topProducts.length > 0;
    const showTopPosts =
        (isSuper || isAdmin || isAuthor || isEditor) &&
        topPosts &&
        topPosts.length > 0;
    const showLowStockAlerts =
        (isSuper || isAdmin || isSeller) &&
        lowStockProducts &&
        lowStockProducts.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* USER Dashboard - Stats + Recent Orders */}
                {showUserStats && <UserStats stats={userStats} />}
                {showUserRecentOrders && (
                    <UserRecentOrders orders={userRecentOrders} />
                )}

                {/* Platform Stats - Admin Only */}
                {showPlatformStats && <PlatformStats stats={platformStats} />}

                {/* Author Stats - Author/Editor */}
                {showAuthorStats && <AuthorStats stats={authorStats} />}

                {/* Blog Stats */}
                {showBlogStats && <BlogStats stats={blogStats} />}

                {/* Ecommerce Stats */}
                {showEcommerceStats && (
                    <EcommerceStats stats={ecommerceStats} />
                )}

                {/* Moderation Queue */}
                {showModerationStats && (
                    <ModerationStats stats={moderationStats} />
                )}

                {/* Low Stock Alerts */}
                {showLowStockAlerts && (
                    <LowStockAlerts products={lowStockProducts} />
                )}

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    {showRevenueChart && <RevenueChart data={revenueChart} />}

                    {/* Orders Chart */}
                    {showOrdersChart && <OrdersChart data={ordersChart} />}

                    {/* Post Activity Chart */}
                    {showPostViewsChart && (
                        <PostViewsChart data={postViewsChart} />
                    )}

                    {/* User Growth Chart */}
                    {showUserGrowthChart && (
                        <UserGrowthChart data={userGrowthChart} />
                    )}

                    {/* Moderation Activity Chart */}
                    {showModerationActivityChart && (
                        <ModerationActivityChart
                            data={moderationActivityChart}
                        />
                    )}
                </div>

                {/* Recent Activity Tables */}
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Recent Orders */}
                    {showRecentOrders && <RecentOrders orders={recentOrders} />}

                    {/* Recent Posts */}
                    {showRecentPosts && <RecentPosts posts={recentPosts} />}

                    {/* Recent Reviews */}
                    {showRecentReviews && (
                        <RecentReviews reviews={recentReviews} />
                    )}

                    {/* Top Products */}
                    {showTopProducts && <TopProducts products={topProducts} />}

                    {/* Top Posts */}
                    {showTopPosts && <TopPosts posts={topPosts} />}
                </div>
            </div>
        </AppLayout>
    );
}
