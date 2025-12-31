import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDollarSign, Clock, Package, ShoppingCart } from 'lucide-react';

interface EcommerceStatsProps {
    stats: {
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
}

function formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function EcommerceStats({ stats }: EcommerceStatsProps) {
    const items = [
        {
            title: 'Products',
            value: stats.totalProducts.toLocaleString(),
            description: `${stats.activeProducts} active`,
            icon: Package,
        },
        {
            title: 'Orders',
            value: stats.totalOrders.toLocaleString(),
            description: `${stats.pendingOrders} pending`,
            icon: ShoppingCart,
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders.toLocaleString(),
            description: 'Awaiting processing',
            icon: Clock,
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            description: `${formatCurrency(stats.monthRevenue)} this month`,
            icon: BadgeDollarSign,
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
