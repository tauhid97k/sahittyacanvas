import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { type Notification, type NotificationType } from '@/types/notification';
import { type PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    Bell,
    CheckCheck,
    CheckCircle,
    Eye,
    Heart,
    MessageCircle,
    MoreVertical,
    Send,
    Trash2,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    notifications: PaginatedData<Notification>;
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    types: NotificationType[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/dashboard/notifications' },
];

const notificationIcons: Record<string, React.ElementType> = {
    post_published: Send,
    post_liked: Heart,
    post_commented: MessageCircle,
    comment_replied: MessageCircle,
    user_followed: UserPlus,
    content_approved: CheckCircle,
    content_rejected: XCircle,
    system: Bell,
};

export default function NotificationsIndex({
    notifications,
    filters,
    types,
}: Props) {
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null);

    const handleSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/notifications',
            { ...filters, search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true },
        );
    }, 300);

    const handleTypeChange = (value: string) => {
        router.get(
            '/dashboard/notifications',
            { ...filters, type: value === 'all' ? undefined : value, page: 1 },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (value: string) => {
        router.get(
            '/dashboard/notifications',
            {
                ...filters,
                status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleMarkAsRead = (id: string) => {
        router.post(
            `/dashboard/notifications/${id}/read`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleMarkAllAsRead = () => {
        router.post(
            '/dashboard/notifications/read-all',
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleDelete = (id: string) => {
        router.delete(`/dashboard/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    const columns: ColumnDef<Notification>[] = [
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const Icon = notificationIcons[row.original.type] || Bell;
                return (
                    <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span className="text-sm capitalize">
                            {row.original.type.replace(/_/g, ' ')}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <p className="truncate font-medium">{row.original.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                        {row.original.message}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Time',
            cell: ({ row }) => (
                <span className="text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(row.original.created_at)}
                </span>
            ),
        },
        {
            accessorKey: 'read_at',
            header: 'Status',
            cell: ({ row }) =>
                row.original.read_at ? (
                    <Badge variant="secondary">Read</Badge>
                ) : (
                    <Badge variant="default">Unread</Badge>
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
                        <DropdownMenuItem
                            onClick={() =>
                                setSelectedNotification(row.original)
                            }
                        >
                            <Eye />
                            View
                        </DropdownMenuItem>
                        {!row.original.read_at && (
                            <DropdownMenuItem
                                onClick={() =>
                                    handleMarkAsRead(row.original.id)
                                }
                            >
                                <CheckCircle />
                                Mark as read
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(row.original.id)}
                        >
                            <Trash2 />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const unreadCount = notifications.data.filter(
        (n: Notification) => !n.read_at,
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            Notifications
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your notifications
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                                <Input
                                    placeholder="Search notifications..."
                                    defaultValue={filters.search || ''}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="w-full sm:max-w-sm"
                                />
                                <Select
                                    value={filters.type || 'all'}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        {types.map((type) => (
                                            <SelectItem
                                                key={type}
                                                value={type}
                                                className="capitalize"
                                            >
                                                {type.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="unread">
                                            Unread
                                        </SelectItem>
                                        <SelectItem value="read">
                                            Read
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Table */}
                        <DataTable
                            columns={columns}
                            data={notifications.data}
                        />

                        {/* Pagination */}
                        <Pagination
                            links={notifications.links}
                            from={notifications.from}
                            to={notifications.to}
                            total={notifications.total}
                            perPage={notifications.per_page}
                            currentPath="/dashboard/notifications"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Notification Detail Dialog */}
            <Dialog
                open={!!selectedNotification}
                onOpenChange={(open) => !open && setSelectedNotification(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedNotification &&
                                (() => {
                                    const Icon =
                                        notificationIcons[
                                            selectedNotification.type
                                        ] || Bell;
                                    return <Icon className="size-5" />;
                                })()}
                            {selectedNotification?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedNotification?.created_at &&
                                formatDistanceToNow(
                                    new Date(selectedNotification.created_at),
                                    { addSuffix: true },
                                )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {selectedNotification?.message}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    selectedNotification?.read_at
                                        ? 'secondary'
                                        : 'default'
                                }
                            >
                                {selectedNotification?.read_at
                                    ? 'Read'
                                    : 'Unread'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {selectedNotification?.type.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                        {selectedNotification?.data.action_url && (
                            <Button asChild className="w-full">
                                <Link
                                    href={selectedNotification.data.action_url}
                                >
                                    View Content
                                </Link>
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
