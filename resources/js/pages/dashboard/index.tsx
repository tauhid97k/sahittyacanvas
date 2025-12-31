import {
    BlogStats,
    EcommerceStats,
    ModerationStats,
    OrdersChart,
    PlatformStats,
    PostViewsChart,
    RecentOrders,
    RecentPosts,
    RecentReviews,
    RevenueChart,
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
    isModerator: boolean;
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
    revenueChart?: Array<{ date: string; revenue: number }>;
    ordersChart?: Array<{ status: string; count: number }>;
    postViewsChart?: Array<{ date: string; posts: number }>;
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
    isModerator,
    platformStats,
    blogStats,
    ecommerceStats,
    moderationStats,
    revenueChart,
    ordersChart,
    postViewsChart,
    recentOrders,
    recentPosts,
    recentReviews,
}: DashboardProps) {
    const showPlatformStats = (isSuper || isAdmin) && platformStats;
    const showBlogStats = (isSuper || isAdmin || isAuthor) && blogStats;
    const showEcommerceStats =
        (isSuper || isAdmin || isSeller) && ecommerceStats;
    const showModerationStats =
        (isSuper || isAdmin || isModerator) && moderationStats;
    const showRevenueChart = (isSuper || isAdmin || isSeller) && revenueChart;
    const showOrdersChart = (isSuper || isAdmin || isSeller) && ordersChart;
    const showPostViewsChart =
        (isSuper || isAdmin || isAuthor) && postViewsChart;
    const showRecentOrders = (isSuper || isAdmin || isSeller) && recentOrders;
    const showRecentPosts = (isSuper || isAdmin || isAuthor) && recentPosts;
    const showRecentReviews = (isSuper || isAdmin || isSeller) && recentReviews;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* Platform Stats - Admin Only */}
                {showPlatformStats && <PlatformStats stats={platformStats} />}

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

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    {showRevenueChart && <RevenueChart data={revenueChart} />}

                    {/* Orders Chart */}
                    {showOrdersChart && <OrdersChart data={ordersChart} />}

                    {/* Post Views Chart */}
                    {showPostViewsChart && (
                        <PostViewsChart data={postViewsChart} />
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
                </div>
            </div>
        </AppLayout>
    );
}
