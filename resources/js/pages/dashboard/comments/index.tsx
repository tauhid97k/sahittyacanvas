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
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    Check,
    Eye,
    MoreVertical,
    Reply,
    Trash,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    is_approved: boolean;
    moderation_status: 'approved' | 'rejected' | 'auto' | 'pending';
    replies_count: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    post: {
        id: number;
        title_bn: string;
        title_en: string;
        slug: string;
    };
    parent?: {
        id: number;
        content: string;
        user_id: number;
        user: {
            id: number;
            name: string;
        };
    } | null;
}

interface Props {
    comments: PaginatedData<Comment>;
    filters: {
        search: string;
        status: string;
    };
    commentModerationEnabled: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comments', href: '/dashboard/comments' },
];

export default function CommentsIndex({
    comments,
    filters,
    commentModerationEnabled,
}: Props) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/comments',
            { ...filters, search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleStatusFilter = (value: string) => {
        router.get(
            '/dashboard/comments',
            {
                ...filters,
                status: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openDelete = (comment: Comment) => {
        setSelectedComment(comment);
        setOpenDeleteDialog(true);
    };

    const handleDelete = () => {
        if (!selectedComment) return;

        setIsDeleting(true);
        router.delete(`/dashboard/comments/${selectedComment.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Comment deleted successfully');
                setOpenDeleteDialog(false);
                setSelectedComment(null);
            },
            onError: () => {
                toast.error('Failed to delete comment');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleApprove = (comment: Comment) => {
        setIsApproving(true);
        router.post(
            `/dashboard/comments/${comment.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Comment approved successfully');
                },
                onError: () => {
                    toast.error('Failed to approve comment');
                },
                onFinish: () => {
                    setIsApproving(false);
                },
            },
        );
    };

    const columns: ColumnDef<Comment>[] = [
        {
            accessorKey: 'content',
            header: 'Comment',
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="line-clamp-2">{row.original.content}</p>
                    {row.original.parent && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Reply className="size-3" />
                            <span>
                                Reply to {row.original.parent.user.name}
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'user',
            header: 'User',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                        {row.original.user.avatar ? (
                            <img
                                src={row.original.user.avatar}
                                alt={row.original.user.name}
                                className="size-9 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-medium">
                                {row.original.user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium">{row.original.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {row.original.user.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'post',
            header: 'Post',
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <p className="line-clamp-1 font-medium">
                        {row.original.post.title_bn}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'moderation_status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.moderation_status;
                const variants: Record<
                    string,
                    'default' | 'secondary' | 'destructive' | 'outline'
                > = {
                    approved: 'default',
                    auto: 'outline',
                    pending: 'secondary',
                    rejected: 'destructive',
                };
                const labels: Record<string, string> = {
                    approved: 'Approved',
                    auto: 'Auto',
                    pending: 'Pending',
                    rejected: 'Rejected',
                };
                return (
                    <Badge variant={variants[status] || 'secondary'}>
                        {labels[status] || status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(row.original.created_at), {
                        addSuffix: true,
                    })}
                </span>
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
                                href={`/dashboard/posts/${row.original.post.slug}`}
                            >
                                <Eye />
                                View Post
                            </Link>
                        </DropdownMenuItem>
                        {!row.original.is_approved && (
                            <DropdownMenuItem
                                onClick={() => handleApprove(row.original)}
                                disabled={isApproving}
                            >
                                <Check />
                                Approve
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(row.original)}
                        >
                            <Trash />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comments" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Comments</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage post comments
                        </p>
                    </div>
                    <Badge
                        variant={
                            commentModerationEnabled ? 'default' : 'secondary'
                        }
                    >
                        Moderation: {commentModerationEnabled ? 'On' : 'Off'}
                    </Badge>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Input
                                placeholder="Search comments..."
                                defaultValue={filters.search || ''}
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                                className="w-full sm:max-w-sm"
                            />
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={comments.data} />

                        {/* Pagination */}
                        <Pagination
                            links={comments.links}
                            from={comments.from}
                            to={comments.to}
                            total={comments.total}
                            perPage={comments.per_page}
                            currentPath="/dashboard/comments"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment by{' '}
                            <strong>{selectedComment?.user.name}</strong>? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
