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
import { Transaction } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle,
    CreditCard,
    RefreshCcw,
    ShoppingCart,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    transaction: Transaction;
}

const statusColors: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    refunded: 'secondary',
    failed: 'destructive',
};

export default function TransactionShow({ transaction }: Props) {
    const [paidDialogOpen, setPaidDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Transactions', href: '/dashboard/transactions' },
        {
            title: `#${transaction.id}`,
            href: `/dashboard/transactions/${transaction.id}`,
        },
    ];

    const handleMarkPaid = () => {
        setIsUpdating(true);
        router.post(
            `/dashboard/transactions/${transaction.id}/paid`,
            {},
            {
                onSuccess: () => {
                    toast.success('Transaction marked as paid');
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

    const handleRefund = () => {
        setIsUpdating(true);
        router.post(
            `/dashboard/transactions/${transaction.id}/refund`,
            {},
            {
                onSuccess: () => {
                    toast.success('Transaction refunded');
                    setRefundDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to refund');
                },
                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction #${transaction.id}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/transactions">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            Transaction #{transaction.id}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Created on{' '}
                            {new Date(
                                transaction.created_at,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {transaction.status === 'pending' && (
                            <Button onClick={() => setPaidDialogOpen(true)}>
                                <CheckCircle />
                                Mark as Paid
                            </Button>
                        )}
                        {transaction.status === 'paid' && (
                            <Button
                                variant="outline"
                                onClick={() => setRefundDialogOpen(true)}
                            >
                                <RefreshCcw />
                                Refund
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Transaction Details */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="size-5" />
                                Transaction Details
                            </CardTitle>
                            <CardDescription>
                                Payment information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Amount
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {transaction.formatted_amount}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Currency
                                    </div>
                                    <div className="text-lg font-medium">
                                        {transaction.currency}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Status
                                    </div>
                                    <Badge
                                        variant={
                                            statusColors[transaction.status] as
                                                | 'default'
                                                | 'warning'
                                                | 'success'
                                                | 'destructive'
                                                | 'secondary'
                                        }
                                        className="mt-1"
                                    >
                                        {transaction.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            transaction.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Transaction Reference
                                    </div>
                                    <div className="font-mono text-sm">
                                        {transaction.gateway_transaction_id ||
                                            '—'}
                                    </div>
                                </div>
                            </div>

                            {transaction.paid_at && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            Paid At
                                        </div>
                                        <div className="font-medium">
                                            {new Date(
                                                transaction.paid_at,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </>
                            )}

                            {transaction.refunded_at && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            Refunded At
                                        </div>
                                        <div className="font-medium">
                                            {new Date(
                                                transaction.refunded_at,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        {/* Payer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="size-5" />
                                    Payer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <div className="font-medium">
                                        {transaction.payer?.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {transaction.payer?.email}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="size-5" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {transaction.paymentMethod ? (
                                    <>
                                        <div className="font-medium">
                                            {transaction.paymentMethod.name}
                                        </div>
                                        {transaction.paymentMethod.is_cod && (
                                            <Badge variant="warning">
                                                Cash on Delivery
                                            </Badge>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">
                                        Not specified
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Related Order */}
                        {transaction.transactionable_type?.includes(
                            'Order',
                        ) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="size-5" />
                                        Related Order
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="w-full"
                                    >
                                        <Link
                                            href={`/dashboard/orders/${transaction.transactionable_id}`}
                                        >
                                            View Order
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Mark Paid Dialog */}
            <AlertDialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to mark this transaction as
                            paid?
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

            {/* Refund Dialog */}
            <AlertDialog
                open={refundDialogOpen}
                onOpenChange={setRefundDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Refund Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to refund this transaction?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefund}
                            isLoading={isUpdating}
                            variant="destructive"
                        >
                            Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
