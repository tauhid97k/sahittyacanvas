import { AdvancedSelect } from '@/components/ui/advanced-select';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { NoImage } from '@/components/ui/no-image';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Category, Post } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    ArrowLeft,
    Bookmark,
    Eye,
    FileText,
    Heart,
    LayoutList,
    MoreVertical,
    Pencil,
    Plus,
    RotateCcw,
    Trash,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    posts: PaginatedData<Post>;
    categories: Pick<Category, 'id' | 'name_bn' | 'name_en'>[];
    filters: {
        search: string;
        status: string;
        category: string;
        trashed: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/dashboard/posts' },
];

const statusColors: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    draft: 'secondary',
    pending: 'outline',
    published: 'default',
    archived: 'destructive',
};

export default function PostsIndex({ posts, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
    const [openForceDeleteDialog, setOpenForceDeleteDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Category options for AdvancedSelect
    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        ...categories.map((cat) => ({
            value: cat.id.toString(),
            label: cat.name_bn,
            description: cat.name_en || undefined,
        })),
    ];

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/posts',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleFilterChange = (key: string, value: string | undefined) => {
        router.get(
            '/dashboard/posts',
            {
                ...filters,
                [key]: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Open Delete Dialog
    const openDelete = (post: Post) => {
        setSelectedPost(post);
        setOpenDeleteDialog(true);
    };

    // Handle Delete (soft delete)
    const handleDelete = () => {
        if (!selectedPost) return;

        setIsDeleting(true);
        router.delete(`/dashboard/posts/${selectedPost.slug}`, {
            onSuccess: () => {
                toast.success('Post moved to recycle bin');
                setOpenDeleteDialog(false);
                setSelectedPost(null);
            },
            onError: () => {
                toast.error('Failed to delete post');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Handle Restore
    const handleRestore = () => {
        if (!selectedPost) return;

        setIsRestoring(true);
        router.post(`/dashboard/posts/${selectedPost.id}/restore`, {}, {
            onSuccess: () => {
                toast.success('Post restored successfully');
                setOpenRestoreDialog(false);
                setSelectedPost(null);
            },
            onError: () => {
                toast.error('Failed to restore post');
            },
            onFinish: () => {
                setIsRestoring(false);
            },
        });
    };

    // Handle Force Delete (permanent)
    const handleForceDelete = () => {
        if (!selectedPost) return;

        setIsDeleting(true);
        router.delete(`/dashboard/posts/${selectedPost.id}/force-delete`, {
            onSuccess: () => {
                toast.success('Post permanently deleted');
                setOpenForceDeleteDialog(false);
                setSelectedPost(null);
            },
            onError: () => {
                toast.error('Failed to delete post');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Toggle trash view
    const toggleTrashView = () => {
        router.get(
            '/dashboard/posts',
            { trashed: !filters.trashed ? '1' : undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Table columns
    const columns: ColumnDef<Post>[] = [
        {
            accessorKey: 'featured_image_url',
            header: 'Image',
            cell: ({ row }) =>
                row.original.featured_image_url ? (
                    <img
                        src={row.original.featured_image_url}
                        alt={row.original.title_bn}
                        className="size-14 rounded-md object-cover"
                    />
                ) : (
                    <NoImage className="size-14" />
                ),
        },
        {
            accessorKey: 'title_bn',
            header: 'Title',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <div className="truncate font-medium">
                        {row.original.title_bn}
                    </div>
                    {row.original.excerpt && (
                        <div className="truncate text-sm text-muted-foreground">
                            {row.original.excerpt}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'categories',
            header: 'Categories',
            cell: ({ row }) =>
                row.original.categories &&
                row.original.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {row.original.categories.map((cat) => (
                            <Badge key={cat.id} variant="secondary">
                                {cat.name_bn}
                            </Badge>
                        ))}
                    </div>
                ) : null,
        },
        {
            accessorKey: 'author',
            header: 'Author',
            cell: ({ row }) =>
                row.original.author ? (
                    <span className="text-sm text-muted-foreground">
                        {row.original.author.name_bn}
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        {row.original.user?.name}
                    </span>
                ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={statusColors[row.original.status]}>
                    {row.original.status.charAt(0).toUpperCase() +
                        row.original.status.slice(1)}
                </Badge>
            ),
        },
        {
            accessorKey: 'visit_count_total',
            header: 'Views',
            cell: ({ row }) => (
                <span className="flex items-center justify-center gap-1.5">
                    <Eye className="size-5" />
                    {row.original.visit_count_total ?? 0}
                </span>
            ),
        },
        {
            accessorKey: 'likes_count',
            header: 'Likes',
            cell: ({ row }) => (
                <span className="flex items-center justify-center gap-1.5">
                    <Heart className="size-5" />
                    {row.original.likes_count ?? 0}
                </span>
            ),
        },
        {
            accessorKey: 'bookmarks_count',
            header: 'Bookmarks',
            cell: ({ row }) => (
                <span className="flex items-center justify-center gap-1.5">
                    <Bookmark className="size-5" />
                    {row.original.bookmarks_count ?? 0}
                </span>
            ),
        },
        {
            accessorKey: 'pages_count',
            header: 'Pages',
            cell: ({ row }) => (
                <span className="flex items-center justify-center gap-1.5">
                    <FileText className="size-5" />
                    {(row.original.pages_count ?? 0) + 1}
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
                        {filters.trashed ? (
                            <>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedPost(row.original);
                                        setOpenRestoreDialog(true);
                                    }}
                                >
                                    <RotateCcw />
                                    Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => {
                                        setSelectedPost(row.original);
                                        setOpenForceDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 />
                                    Delete Permanently
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/dashboard/posts/${row.original.slug}`}
                                    >
                                        <Eye />
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/dashboard/posts/${row.original.slug}/edit`}
                                    >
                                        <Pencil />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => openDelete(row.original)}
                                >
                                    <Trash />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={filters.trashed ? '/dashboard/posts' : '/dashboard'}>
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            {filters.trashed ? 'Recycle Bin' : 'Posts'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {filters.trashed
                                ? 'Restore or permanently delete posts'
                                : 'Manage your blog posts'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={filters.trashed ? 'default' : 'outline'}
                            onClick={toggleTrashView}
                        >
                            {filters.trashed ? <LayoutList /> : <Trash2 />}
                            {filters.trashed ? 'All Posts' : 'Recycle Bin'}
                        </Button>
                        {!filters.trashed && (
                            <Button asChild>
                                <Link href="/dashboard/posts/create">
                                    <Plus />
                                    Add Post
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <Input
                                placeholder="Search posts..."
                                value={search}
                                type="search"
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="max-w-sm"
                            />
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange('status', value)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <AdvancedSelect
                                options={categoryOptions}
                                value={filters.category || 'all'}
                                onChange={(value) =>
                                    handleFilterChange('category', value)
                                }
                                placeholder="Category"
                                className="w-[200px]"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={posts.data} />

                        {/* Pagination */}
                        <Pagination
                            links={posts.links}
                            from={posts.from}
                            to={posts.to}
                            total={posts.total}
                            perPage={posts.per_page}
                            currentPath="/dashboard/posts"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog (soft delete) */}
            <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to move "{selectedPost?.title_bn}" to the recycle bin?
                            You can restore it later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            className={cn(
                                buttonVariants({ variant: 'destructive' }),
                            )}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Restore Dialog */}
            <AlertDialog
                open={openRestoreDialog}
                onOpenChange={setOpenRestoreDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to restore "{selectedPost?.title_bn}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRestoring}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRestore}
                            isLoading={isRestoring}
                        >
                            Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Force Delete Dialog (permanent) */}
            <AlertDialog
                open={openForceDeleteDialog}
                onOpenChange={setOpenForceDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete "{selectedPost?.title_bn}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleForceDelete}
                            isLoading={isDeleting}
                            className={cn(
                                buttonVariants({ variant: 'destructive' }),
                            )}
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
