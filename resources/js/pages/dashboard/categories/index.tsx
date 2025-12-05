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
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Category } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    categories: PaginatedData<Category>;
    filters: {
        search: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/dashboard/categories' },
];

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/categories',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    // Open Delete Dialog
    const openDelete = (category: Category) => {
        setSelectedCategory(category);
        setOpenDeleteDialog(true);
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedCategory) return;

        setIsDeleting(true);
        router.delete(`/dashboard/categories/${selectedCategory.slug}`, {
            onSuccess: () => {
                toast.success('Category deleted successfully');
                setOpenDeleteDialog(false);
                setSelectedCategory(null);
            },
            onError: () => {
                toast.error('Failed to delete category');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table columns
    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'name_bn',
            header: 'Name (Bengali)',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name_bn}</div>
            ),
        },
        {
            accessorKey: 'name_en',
            header: 'Name (English)',
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {row.original.name_en}
                </div>
            ),
        },
        {
            accessorKey: 'parent',
            header: 'Parent',
            cell: ({ row }) =>
                row.original.parent ? (
                    <Badge variant="secondary">
                        {row.original.parent.name_bn}
                    </Badge>
                ) : null,
        },
        {
            accessorKey: 'posts_count',
            header: 'Posts',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.posts_count || 0}
                </Badge>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
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
                                href={`/dashboard/categories/${row.original.slug}/edit`}
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
            <Head title="Categories" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your content categories
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/categories/create">
                            <Plus />
                            Add Category
                        </Link>
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Search */}
                        <div className="mb-6 flex items-center gap-4">
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                type="search"
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="max-w-sm"
                            />
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={categories.data} />

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <Pagination
                                links={categories.links}
                                from={categories.from}
                                to={categories.to}
                                total={categories.total}
                                perPage={categories.per_page}
                                currentPath="/dashboard/categories"
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
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedCategory?.name_bn}"? This action cannot be
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
