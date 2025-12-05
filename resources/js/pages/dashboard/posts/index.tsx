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
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
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
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Handle Delete
    const handleDelete = () => {
        if (!selectedPost) return;

        setIsDeleting(true);
        router.delete(`/dashboard/posts/${selectedPost.slug}`, {
            onSuccess: () => {
                toast.success('Post deleted successfully');
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Posts</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your blog posts
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/posts/create">
                            <Plus />
                            Add Post
                        </Link>
                    </Button>
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
                        {posts.last_page > 1 && (
                            <Pagination
                                links={posts.links}
                                from={posts.from}
                                to={posts.to}
                                total={posts.total}
                                perPage={posts.per_page}
                                currentPath="/dashboard/posts"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedPost?.title_bn}"? This action cannot be
                            undone.
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
        </AppLayout>
    );
}
