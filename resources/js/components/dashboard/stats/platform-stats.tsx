import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, ShoppingCart, Users } from 'lucide-react';

interface PlatformStatsProps {
    stats: {
        totalUsers: number;
        totalPosts: number;
        totalProducts: number;
        totalOrders: number;
        newUsersToday: number;
        newUsersThisWeek: number;
    };
}

export function PlatformStats({ stats }: PlatformStatsProps) {
    const items = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            description: `+${stats.newUsersToday} today, +${stats.newUsersThisWeek} this week`,
            icon: Users,
        },
        {
            title: 'Total Posts',
            value: stats.totalPosts.toLocaleString(),
            description: 'Published articles',
            icon: FileText,
        },
        {
            title: 'Total Products',
            value: stats.totalProducts.toLocaleString(),
            description: 'Listed products',
            icon: Package,
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toLocaleString(),
            description: 'All time orders',
            icon: ShoppingCart,
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
                        <item.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
