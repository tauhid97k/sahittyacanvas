import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
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
import { Activity } from '@/types/activity';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowLeft, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    activities: PaginatedData<Activity>;
    events: string[];
    filters: {
        search: string;
        event: string;
        date_from: string;
        date_to: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activities', href: '/dashboard/activities' },
];

export default function ActivitiesIndex({
    activities,
    events,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (filters.date_from || filters.date_to) {
            return {
                from: filters.date_from
                    ? new Date(filters.date_from)
                    : undefined,
                to: filters.date_to ? new Date(filters.date_to) : undefined,
            };
        }
        return undefined;
    });

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/activities',
            {
                search: value || undefined,
                event: filters.event || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleEventChange = (value: string) => {
        router.get(
            '/dashboard/activities',
            {
                search: filters.search || undefined,
                event: value || undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        router.get(
            '/dashboard/activities',
            {
                search: filters.search || undefined,
                event: filters.event || undefined,
                date_from: range?.from
                    ? format(range.from, 'yyyy-MM-dd')
                    : undefined,
                date_to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    // Get event badge variant
    const getEventBadgeVariant = (event: string | null) => {
        switch (event) {
            case 'created':
                return 'default';
            case 'updated':
                return 'secondary';
            case 'deleted':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Table columns
    const columns: ColumnDef<Activity>[] = [
        {
            accessorKey: 'created_at',
            header: 'Time',
            cell: ({ row }) => (
                <div className="text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(row.original.created_at)}
                </div>
            ),
        },
        {
            accessorKey: 'subject_type_label',
            header: 'Module',
            cell: ({ row }) => (
                <Badge variant="default" className="capitalize">
                    {row.original.subject_type_label || '-'}
                </Badge>
            ),
        },
        {
            accessorKey: 'causer_name',
            header: 'User',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.causer_name}</div>
            ),
        },
        {
            accessorKey: 'event',
            header: 'Event',
            cell: ({ row }) =>
                row.original.event ? (
                    <Badge
                        variant={getEventBadgeVariant(row.original.event)}
                        className="capitalize"
                    >
                        {row.original.event}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="max-w-xs truncate text-sm capitalize">
                    {row.original.description}
                </div>
            ),
        },
        {
            accessorKey: 'log_name',
            header: 'Log',
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.log_name || 'default'}
                </Badge>
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
                            <Link
                                href={`/dashboard/activities/${row.original.id}`}
                            >
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
            <Head title="Activities" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">Activity Log</h1>
                        <p className="text-sm text-muted-foreground">
                            Track all system activities and changes
                        </p>
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Search & Filters - All inline */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                                <Input
                                    placeholder="Search activities..."
                                    value={search}
                                    type="search"
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    className="w-full sm:w-[250px]"
                                />
                                <Select
                                    value={filters.event || 'all'}
                                    onValueChange={(value) =>
                                        handleEventChange(
                                            value === 'all' ? '' : value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="All Events" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Events
                                        </SelectItem>
                                        {events.map((event) => (
                                            <SelectItem
                                                key={event}
                                                value={event}
                                                className="capitalize"
                                            >
                                                {event}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DateRangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                placeholder="Filter by date range"
                                className="w-full lg:w-auto"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={activities.data} />

                        {/* Pagination */}
                        <Pagination
                            links={activities.links}
                            from={activities.from}
                            to={activities.to}
                            total={activities.total}
                            perPage={activities.per_page}
                            currentPath="/dashboard/activities"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
