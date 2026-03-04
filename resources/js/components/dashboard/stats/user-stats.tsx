import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Heart, ShoppingCart, Truck } from 'lucide-react';

interface UserStatsProps {
    stats: {
        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        wishlistCount: number;
        bookmarkCount: number;
        followingCount: number;
    };
}

export function UserStats({ stats }: UserStatsProps) {
    const items = [
        {
            title: 'My Orders',
            value: stats.totalOrders.toLocaleString(),
            description: `${stats.pendingOrders} pending`,
            icon: ShoppingCart,
        },
        {
            title: 'Delivered',
            value: stats.deliveredOrders.toLocaleString(),
            description: 'Completed orders',
            icon: Truck,
        },
        {
            title: 'Wishlist',
            value: stats.wishlistCount.toLocaleString(),
            description: 'Saved products',
            icon: Heart,
        },
        {
            title: 'Bookmarks',
            value: stats.bookmarkCount.toLocaleString(),
            description: 'Saved posts',
            icon: Bookmark,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className="size-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-sm text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
