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
import { NoImage } from '@/components/ui/no-image';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ProductCategory } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MoreVertical, Pencil, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    categories: PaginatedData<ProductCategory>;
    filters: {
        search: string;
        status: string;
    };
    can: {
        create_product_category: boolean;
        edit_product_category: boolean;
        delete_product_category: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Product Categories', href: '/dashboard/product-categories' },
];

export default function ProductCategoriesIndex({ categories, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<ProductCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/product-categories',
            { search: value || undefined, page: 1 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    // Open Delete Dialog
    const openDelete = (category: ProductCategory) => {
        setSelectedCategory(category);
        setOpenDeleteDialog(true);
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedCategory) return;

        setIsDeleting(true);
        router.delete(
            `/dashboard/product-categories/${selectedCategory.slug}`,
            {
                onSuccess: () => {
                    toast.success('Category deleted successfully');
                    setOpenDeleteDialog(false);
                    setSelectedCategory(null);
                },
                onError: (errors) => {
                    const message =
                        errors.delete || 'Failed to delete category';
                    toast.error(message);
                    setOpenDeleteDialog(false);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            },
        );
    };

    // Table columns
    const columns: ColumnDef<ProductCategory>[] = [
        {
            accessorKey: 'image_url',
            header: 'Image',
            cell: ({ row }) =>
                row.original.image_url ? (
                    <img
                        src={row.original.image_url}
                        alt={row.original.name_bn}
                        className="size-14 rounded-md object-cover"
                    />
                ) : (
                    <NoImage className="size-14" />
                ),
        },
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
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'products_count',
            header: 'Products',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.original.products_count || 0}
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
                        {can.edit_product_category && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/dashboard/product-categories/${row.original.slug}/edit`}
                                >
                                    <Pencil />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {can.delete_product_category && (
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => openDelete(row.original)}
                            >
                                <Trash />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Categories" />

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
                            Product Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your product categories
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/product-categories/create">
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
                        <Pagination
                            links={categories.links}
                            from={categories.from}
                            to={categories.to}
                            total={categories.total}
                            perPage={categories.per_page}
                            currentPath="/dashboard/product-categories"
                        />
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
                            variant="destructive"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
