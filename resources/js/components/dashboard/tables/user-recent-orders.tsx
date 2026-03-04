import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface Order {
    id: number;
    order_number: string;
    seller: string;
    total: string;
    status: string;
    payment_status: string;
    created_at: string;
}

interface UserRecentOrdersProps {
    orders: Order[];
}

const statusColors: Record<
    string,
    'default' | 'warning' | 'success' | 'destructive'
> = {
    pending: 'warning',
    confirmed: 'default',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'destructive',
    refunded: 'destructive',
};

const paymentColors: Record<
    string,
    'default' | 'warning' | 'success' | 'destructive'
> = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'destructive',
};

export function UserRecentOrders({ orders }: UserRecentOrdersProps) {
    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Recent Orders</CardTitle>
                    <CardDescription>You haven't placed any orders yet</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>My Recent Orders</span>
                    <Link
                        href="/my-orders"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Your latest orders</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/my-orders/${order.id}`}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {order.order_number}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    Seller: {order.seller}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-medium">{order.total}</p>
                                <p className="text-xs text-muted-foreground">
                                    {order.created_at}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                                <Badge
                                    variant={
                                        statusColors[order.status] ||
                                        'default'
                                    }
                                    className="text-xs"
                                >
                                    {order.status}
                                </Badge>
                                <Badge
                                    variant={
                                        paymentColors[
                                            order.payment_status
                                        ] || 'default'
                                    }
                                    className="text-xs"
                                >
                                    {order.payment_status}
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
