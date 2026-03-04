import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Order } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Package,
    Store,
    Truck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    order: Order;
}

const statusColors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'default',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'destructive',
    refunded: 'secondary',
};

export default function MyOrderShow({ order }: Props) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Orders', href: '/my-orders' },
        { title: order.order_number, href: `/my-orders/${order.id}` },
    ];

    const canCancel = order.status === 'pending';

    const handleCancel = () => {
        setIsCancelling(true);
        router.post(
            `/my-orders/${order.id}/cancel`,
            {},
            {
                onSuccess: () => {
                    toast.success('Order cancelled successfully');
                    setCancelDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to cancel order');
                },
                onFinish: () => {
                    setIsCancelling(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order: ${order.order_number}`} />

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/my-orders">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            {order.order_number}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    {canCancel && (
                        <Button
                            variant="destructive"
                            onClick={() => setCancelDialogOpen(true)}
                        >
                            <XCircle />
                            Cancel Order
                        </Button>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Order Items */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="size-5" />
                                Order Items
                            </CardTitle>
                            <CardDescription>
                                {order.items?.length || 0} item(s) in this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 rounded-lg border p-4"
                                    >
                                        {item.product?.featured_image_url ? (
                                            <img
                                                src={
                                                    item.product
                                                        .featured_image_url
                                                }
                                                alt={item.product_name}
                                                className="size-16 rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-16 items-center justify-center rounded-md bg-muted">
                                                <Package className="size-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {item.product_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.formatted_unit_price} ×{' '}
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="font-semibold">
                                            {item.formatted_total}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            {/* Order Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>{order.formatted_subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Shipping
                                    </span>
                                    <span>{order.formatted_shipping_cost}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{order.formatted_total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Seller Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="size-5" />
                                    Seller
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-medium">
                                    {order.seller?.name ?? '—'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="size-5" />
                                    Shipping
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            statusColors[order.status] as
                                                | 'default'
                                                | 'warning'
                                                | 'success'
                                                | 'destructive'
                                        }
                                    >
                                        {order.status_label ?? order.status}
                                    </Badge>
                                </div>
                                {order.tracking_number && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Tracking
                                            </span>
                                            <span className="font-medium">
                                                {order.tracking_number}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Name
                                        </span>
                                        <span className="font-medium">
                                            {order.shipping_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Phone
                                        </span>
                                        <span>{order.shipping_phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Address
                                        </span>
                                        <span className="text-right">
                                            {order.shipping_address}
                                            {order.shipping_city &&
                                                `, ${order.shipping_city}`}
                                            {order.shipping_postal_code &&
                                                ` ${order.shipping_postal_code}`}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Banknote className="size-5" />
                                    Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <Badge
                                        variant={
                                            order.payment_status === 'paid'
                                                ? 'success'
                                                : 'warning'
                                        }
                                    >
                                        {order.payment_status_label ?? order.payment_status}
                                    </Badge>
                                </div>
                                {order.payment_method && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Method
                                        </span>
                                        <span>{order.payment_method}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Buyer Notes */}
                        {order.buyer_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {order.buyer_notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Order Dialog */}
            <AlertDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel order{' '}
                            {order.order_number}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            Keep Order
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            isLoading={isCancelling}
                        >
                            Cancel Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
