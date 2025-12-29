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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Order } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle,
    Package,
    Truck,
    User,
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

export default function OrderShow({ order }: Props) {
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [paidDialogOpen, setPaidDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>(order.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dashboard/orders' },
        { title: order.order_number, href: `/dashboard/orders/${order.id}` },
    ];

    const handleStatusUpdate = () => {
        setIsUpdating(true);
        router.post(
            `/dashboard/orders/${order.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success('Order status updated');
                    setStatusDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to update status');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    const handleMarkPaid = () => {
        setIsUpdating(true);
        router.post(
            `/dashboard/orders/${order.id}/paid`,
            {},
            {
                onSuccess: () => {
                    toast.success('Order marked as paid');
                    setPaidDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to mark as paid');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order: ${order.order_number}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/orders">
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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setStatusDialogOpen(true)}
                        >
                            Update Status
                        </Button>
                        {order.payment_status === 'unpaid' && (
                            <Button onClick={() => setPaidDialogOpen(true)}>
                                <CheckCircle />
                                Mark as Paid
                            </Button>
                        )}
                    </div>
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
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="size-5" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <div className="font-medium">
                                        {order.buyer?.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {order.buyer?.email}
                                    </div>
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
                                        <span className="font-medium text-white">
                                            {order.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                order.status.slice(1)}
                                        </span>
                                    </Badge>
                                </div>
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
                                        <span className="font-medium text-white">
                                            {order.payment_status
                                                .charAt(0)
                                                .toUpperCase() +
                                                order.payment_status.slice(1)}
                                        </span>
                                    </Badge>
                                </div>
                                {order.transaction && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Method
                                            </span>
                                            <span>
                                                {
                                                    order.transaction
                                                        .paymentMethod?.name
                                                }
                                            </span>
                                        </div>
                                        {order.transaction.paymentMethod
                                            ?.is_cod && (
                                            <Badge variant="warning">
                                                Cash on Delivery
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {order.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Update Dialog */}
            <AlertDialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Order Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change the status of order {order.order_number}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                    Confirmed
                                </SelectItem>
                                <SelectItem value="processing">
                                    Processing
                                </SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">
                                    Delivered
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Cancelled
                                </SelectItem>
                                <SelectItem value="refunded">
                                    Refunded
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusUpdate}
                            isLoading={isUpdating}
                        >
                            Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Mark Paid Dialog */}
            <AlertDialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this order as paid?
                            This will also update the associated transaction.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleMarkPaid}
                            isLoading={isUpdating}
                        >
                            Mark as Paid
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
