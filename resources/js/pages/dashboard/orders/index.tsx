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
import { Input } from '@/components/ui/input';
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
import { ArrowLeft, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    orders: PaginatedData<Order>;
    filters: {
        search: string;
        status: string;
        payment_status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dashboard/orders' },
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

export default function OrdersIndex({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/orders',
            {
                search: value || undefined,
                status: filters.status || undefined,
                payment_status: filters.payment_status || undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleStatusFilter = (value: string) => {
        router.get(
            '/dashboard/orders',
            {
                search: filters.search || undefined,
                status: value === 'all' ? undefined : value,
                payment_status: filters.payment_status || undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handlePaymentFilter = (value: string) => {
        router.get(
            '/dashboard/orders',
            {
                search: filters.search || undefined,
                status: filters.status || undefined,
                payment_status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Table columns
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'order_number',
            header: 'Order #',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.order_number}</div>
            ),
        },
        {
            accessorKey: 'buyer',
            header: 'Customer',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.buyer?.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.buyer?.email}
                    </div>
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
                    variant={statusColors[row.original.status] as 'default' | 'warning' | 'success' | 'destructive' | 'secondary'}
                >
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
        {
            accessorKey: 'payment_status',
            header: 'Payment',
            cell: ({ row }) => (
                <Badge
                    variant={paymentColors[row.original.payment_status] as 'default' | 'warning' | 'success' | 'secondary'}
                >
                    {row.original.payment_status.charAt(0).toUpperCase() + row.original.payment_status.slice(1)}
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
            header: 'Actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${row.original.id}`}>
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
            <Head title="Orders" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your orders
                        </p>
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Input
                                placeholder="Search orders..."
                                value={search}
                                type="search"
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.payment_status || 'all'}
                                onValueChange={handlePaymentFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
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
                            currentPath="/dashboard/orders"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
