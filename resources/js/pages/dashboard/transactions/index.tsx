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
import { Transaction } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    transactions: PaginatedData<Transaction>;
    filters: {
        search: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/dashboard/transactions' },
];

const statusColors: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    refunded: 'secondary',
    failed: 'destructive',
};

export default function TransactionsIndex({ transactions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/transactions',
            {
                search: value || undefined,
                status: filters.status || undefined,
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
            '/dashboard/transactions',
            {
                search: filters.search || undefined,
                status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Table columns
    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <div className="font-medium">#{row.original.id}</div>
            ),
        },
        {
            accessorKey: 'payer',
            header: 'Payer',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.payer?.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.payer?.email}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'formatted_amount',
            header: 'Amount',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.formatted_amount}</div>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Method',
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {row.original.paymentMethod?.name || '—'}
                </div>
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
                            <Link href={`/dashboard/transactions/${row.original.id}`}>
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
            <Head title="Transactions" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Transactions</h1>
                        <p className="text-sm text-muted-foreground">
                            View payment transactions
                        </p>
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Input
                                placeholder="Search transactions..."
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
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={transactions.data} />

                        {/* Pagination */}
                        <Pagination
                            links={transactions.links}
                            from={transactions.from}
                            to={transactions.to}
                            total={transactions.total}
                            perPage={transactions.per_page}
                            currentPath="/dashboard/transactions"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
