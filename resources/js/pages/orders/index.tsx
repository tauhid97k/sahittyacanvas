import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Order } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreVertical } from 'lucide-react';

interface Props {
    orders: PaginatedData<Order>;
    filters: {
        status: string;
    };
    statuses: Array<{ value: string; label: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Orders', href: '/my-orders' },
];

const statusColors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'default',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'destructive',
    refunded: 'secondary',
};

const paymentColors: Record<string, string> = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'secondary',
};

export default function MyOrdersIndex({ orders, filters, statuses }: Props) {
    const handleStatusFilter = (value: string) => {
        router.get(
            '/my-orders',
            {
                status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'order_number',
            header: 'Order #',
            cell: ({ row }) => (
                <Link
                    href={`/my-orders/${row.original.id}`}
                    className="font-medium text-primary hover:underline"
                >
                    {row.original.order_number}
                </Link>
            ),
        },
        {
            accessorKey: 'seller',
            header: 'Seller',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.seller?.name ?? '—'}
                </div>
            ),
        },
        {
            accessorKey: 'formatted_total',
            header: 'Total',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.formatted_total}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        statusColors[row.original.status] as
                            | 'default'
                            | 'warning'
                            | 'success'
                            | 'destructive'
                            | 'secondary'
                    }
                >
                    {row.original.status_label ?? row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'payment_status',
            header: 'Payment',
            cell: ({ row }) => (
                <Badge
                    variant={
                        paymentColors[row.original.payment_status] as
                            | 'default'
                            | 'warning'
                            | 'success'
                            | 'secondary'
                    }
                >
                    {row.original.payment_status_label ?? row.original.payment_status}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/my-orders/${row.original.id}`}>
                                <Eye />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 px-4 pt-4 lg:flex-row lg:items-center">
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">My Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            View and track your orders
                        </p>
                    </div>
                </div>

                {/* Card */}
                <Card className="mx-4">
                    <CardContent className="p-4 md:p-6">
                        {/* Filter */}
                        <div className="mb-6 flex items-center gap-4">
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={orders.data} />

                        {/* Pagination */}
                        <Pagination
                            links={orders.links}
                            from={orders.from}
                            to={orders.to}
                            total={orders.total}
                            perPage={orders.per_page}
                            currentPath="/my-orders"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
