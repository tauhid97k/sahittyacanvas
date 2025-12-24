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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Eye, MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Like {
    id: number;
    user_id: number;
    post_id: number;
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
}

interface Props {
    likes: PaginatedData<Like>;
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Likes', href: '/dashboard/likes' },
];

export default function LikesIndex({ likes, filters }: Props) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedLike, setSelectedLike] = useState<Like | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/likes',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const openDelete = (like: Like) => {
        setSelectedLike(like);
        setOpenDeleteDialog(true);
    };

    const handleDelete = () => {
        if (!selectedLike) return;

        setIsDeleting(true);
        router.delete(`/dashboard/likes/${selectedLike.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Like removed successfully');
                setOpenDeleteDialog(false);
                setSelectedLike(null);
            },
            onError: () => {
                toast.error('Failed to remove like');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const columns: ColumnDef<Like>[] = [
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
                <div>
                    <p className="line-clamp-1 font-medium">
                        {row.original.post.title_bn}
                    </p>
                    {row.original.post.title_en && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                            {row.original.post.title_en}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Liked At',
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
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(row.original)}
                        >
                            <Trash />
                            Remove Like
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Likes" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Likes</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage post likes
                        </p>
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                            <Input
                                placeholder="Search likes..."
                                defaultValue={filters.search || ''}
                                onChange={(e) =>
                                    debouncedSearch(e.target.value)
                                }
                                className="w-full sm:max-w-sm"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={likes.data} />

                        {/* Pagination */}
                        <Pagination
                            links={likes.links}
                            from={likes.from}
                            to={likes.to}
                            total={likes.total}
                            perPage={likes.per_page}
                            currentPath="/dashboard/likes"
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
                        <AlertDialogTitle>Remove Like</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this like from{' '}
                            <strong>{selectedLike?.user.name}</strong> on{' '}
                            <strong>{selectedLike?.post.title_bn}</strong>? This
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
                            {isDeleting ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
