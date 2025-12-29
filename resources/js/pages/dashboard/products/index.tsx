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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Product } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle,
    ArrowLeft,
    Eye,
    MoreVertical,
    Pencil,
    Plus,
    Star,
    Trash,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface Props {
    products: PaginatedData<Product>;
    filters: {
        search: string;
        status: string;
        moderation: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Products', href: '/dashboard/products' },
];

const statusColors: Record<string, string> = {
    draft: 'secondary',
    published: 'default',
    archived: 'outline',
};

const moderationColors: Record<string, string> = {
    auto: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
};

export default function ProductsIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            '/dashboard/products',
            {
                search: value || undefined,
                status: filters.status || undefined,
                moderation: filters.moderation || undefined,
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
            '/dashboard/products',
            {
                search: filters.search || undefined,
                status: value === 'all' ? undefined : value,
                moderation: filters.moderation || undefined,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleModerationFilter = (value: string) => {
        router.get(
            '/dashboard/products',
            {
                search: filters.search || undefined,
                status: filters.status || undefined,
                moderation: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Open Delete Dialog
    const openDelete = (product: Product) => {
        setSelectedProduct(product);
        setOpenDeleteDialog(true);
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedProduct) return;

        setIsDeleting(true);
        router.delete(`/dashboard/products/${selectedProduct.slug}`, {
            onSuccess: () => {
                toast.success('Product deleted successfully');
                setOpenDeleteDialog(false);
                setSelectedProduct(null);
            },
            onError: (errors) => {
                const message = errors.delete || 'Failed to delete product';
                toast.error(message);
                setOpenDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table columns
    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'featured_image_url',
            header: 'Image',
            cell: ({ row }) =>
                row.original.featured_image_url ? (
                    <img
                        src={row.original.featured_image_url}
                        alt={row.original.name_bn}
                        className="size-14 rounded-md object-cover"
                    />
                ) : (
                    <NoImage className="size-14" />
                ),
        },
        {
            accessorKey: 'name_bn',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name_bn}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.name_en}
                    </div>
                    {row.original.sku && (
                        <div className="text-xs text-muted-foreground">
                            SKU: {row.original.sku}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'categories',
            header: 'Categories',
            cell: ({ row }) => {
                const cats = row.original.categories || [];
                if (cats.length === 0)
                    return <span className="text-muted-foreground">—</span>;
                return (
                    <div className="max-w-[150px] truncate text-sm">
                        {cats.map((c) => c.name_bn).join(', ')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'formatted_price',
            header: 'Price',
            cell: ({ row }) => (
                <div>
                    {row.original.discount_percentage ? (
                        <>
                            <div className="font-medium text-primary">
                                {row.original.formatted_discounted_price}
                            </div>
                            <div className="mb-1 text-xs font-medium text-muted-foreground line-through">
                                {row.original.formatted_price}
                            </div>
                            <Badge variant="destructive" className="text-xs">
                                -{row.original.discount_percentage}%
                            </Badge>
                        </>
                    ) : (
                        <div className="font-medium">
                            {row.original.formatted_price}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'average_rating',
            header: 'Rating',
            cell: ({ row }) => {
                const rating = row.original.average_rating;
                return rating ? (
                    <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: 'review_count',
            header: 'Reviews',
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.review_count || 0}
                </span>
            ),
        },
        {
            accessorKey: 'stock_count',
            header: 'Stock',
            cell: ({ row }) => {
                const stock = row.original.stock_count;
                const threshold = row.original.stock_alert_threshold;
                const isLow = stock > 0 && stock <= threshold;
                const isOut = stock === 0;

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                isOut
                                    ? 'destructive'
                                    : isLow
                                      ? 'warning'
                                      : 'secondary'
                            }
                        >
                            {stock}
                        </Badge>
                        {isLow && !isOut && (
                            <AlertTriangle className="size-4 text-yellow-500" />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        statusColors[row.original.status] as
                            | 'default'
                            | 'secondary'
                            | 'outline'
                    }
                >
                    {row.original.status === 'draft' && 'Draft'}
                    {row.original.status === 'published' && 'Published'}
                    {row.original.status === 'archived' && 'Archived'}
                </Badge>
            ),
        },
        {
            accessorKey: 'moderation_status',
            header: 'Moderation',
            cell: ({ row }) => (
                <Badge
                    variant={
                        moderationColors[row.original.moderation_status] as
                            | 'default'
                            | 'warning'
                            | 'success'
                            | 'destructive'
                    }
                >
                    {row.original.moderation_status === 'auto' && 'Auto'}
                    {row.original.moderation_status === 'pending' && 'Pending'}
                    {row.original.moderation_status === 'approved' &&
                        'Approved'}
                    {row.original.moderation_status === 'rejected' &&
                        'Rejected'}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => (
                <div className="text-sm">
                    <div>
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </div>
                    {row.original.seller && (
                        <div className="text-xs text-muted-foreground">
                            by {row.original.seller.name}
                        </div>
                    )}
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
                            <Link
                                href={`/dashboard/products/${row.original.slug}`}
                            >
                                <Eye />
                                View Product
                            </Link>
                        </DropdownMenuItem>
                        {row.original.seller && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/dashboard/users/${row.original.seller.id}`}
                                >
                                    <User />
                                    View Seller
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/dashboard/products/${row.original.slug}/edit`}
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
            <Head title="Products" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Products</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your products
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/products/create">
                            <Plus />
                            Add Product
                        </Link>
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Input
                                placeholder="Search products..."
                                value={search}
                                type="search"
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
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
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.moderation || 'all'}
                                onValueChange={handleModerationFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Moderation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Moderation
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={products.data} />

                        {/* Pagination */}
                        <Pagination
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                            perPage={products.per_page}
                            currentPath="/dashboard/products"
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
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedProduct?.name_bn}"? This action cannot be
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
