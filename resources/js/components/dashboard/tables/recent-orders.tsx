import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { User } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    customer: string;
    customer_avatar: string | null;
    total: string;
    status: string;
    payment_status: string;
    created_at: string;
}

interface RecentOrdersProps {
    orders: Order[];
}

const statusColors: Record<
    string,
    'default' | 'warning' | 'success' | 'destructive'
> = {
    pending: 'warning',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'destructive',
};

const paymentColors: Record<
    string,
    'default' | 'warning' | 'success' | 'destructive'
> = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'destructive',
};

export function RecentOrders({ orders }: RecentOrdersProps) {
    if (orders.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recent Orders</span>
                    <Link
                        href="/dashboard/orders"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/dashboard/orders/${order.id}`}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                    {order.customer_avatar ? (
                                        <img
                                            src={order.customer_avatar}
                                            alt={order.customer}
                                            className="size-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {order.order_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.customer}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="font-medium">{order.total}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.created_at}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Badge
                                        variant={
                                            statusColors[order.status] ||
                                            'default'
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                    <Badge
                                        variant={
                                            paymentColors[
                                                order.payment_status
                                            ] || 'default'
                                        }
                                    >
                                        {order.payment_status}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
