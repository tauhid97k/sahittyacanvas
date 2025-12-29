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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { User } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Eye,
    MoreVertical,
    Star,
    Trash,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

interface ReviewWithRelations {
    id: number;
    product_id: number;
    user_id: number;
    order_id: number;
    rating: number;
    review: string | null;
    is_verified_purchase: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    product: {
        id: number;
        name_bn: string;
        name_en: string | null;
        slug: string;
    };
}

interface Props {
    reviews: PaginatedData<ReviewWithRelations>;
    filters: {
        rating: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Product Reviews', href: '/dashboard/product-reviews' },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`size-4 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ProductReviewsIndex({ reviews, filters }: Props) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedReview, setSelectedReview] =
        useState<ReviewWithRelations | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRatingFilter = (value: string) => {
        router.get(
            '/dashboard/product-reviews',
            {
                rating: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Open Delete Dialog
    const openDelete = (review: ReviewWithRelations) => {
        setSelectedReview(review);
        setOpenDeleteDialog(true);
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedReview) return;

        setIsDeleting(true);
        router.delete(`/dashboard/product-reviews/${selectedReview.id}`, {
            onSuccess: () => {
                setOpenDeleteDialog(false);
                setSelectedReview(null);
            },
            onError: () => {
                setOpenDeleteDialog(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table columns
    const columns: ColumnDef<ReviewWithRelations>[] = [
        {
            accessorKey: 'user',
            header: 'User',
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="size-full rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="size-5 text-muted-foreground" />
                            )}
                        </div>
                        <p className="font-medium">{user.name}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'product',
            header: 'Product',
            cell: ({ row }) => {
                const product = row.original.product;
                return (
                    <div>
                        <p className="font-medium">
                            {product.name_en || product.name_bn}
                        </p>
                        {product.name_en && (
                            <p className="text-sm text-muted-foreground">
                                {product.name_bn}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }) => <StarRating rating={row.original.rating} />,
        },
        {
            accessorKey: 'review',
            header: 'Review',
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    {row.original.review ? (
                        <p className="line-clamp-3 text-sm">
                            {row.original.review}
                        </p>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            No review text
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {format(
                        new Date(row.original.created_at),
                        'MMM d, yyyy h:mm a',
                    )}
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
                                href={`/dashboard/products/${row.original.product.slug}`}
                            >
                                <Eye />
                                View Product
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/dashboard/users/${row.original.user.id}`}
                            >
                                <UserIcon />
                                View Seller
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
            <Head title="Product Reviews" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Product Reviews
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage product reviews and ratings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Wrapper */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        {/* Filter */}
                        <div className="mb-6 flex items-center gap-4">
                            <Select
                                value={filters.rating || 'all'}
                                onValueChange={handleRatingFilter}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Ratings" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Ratings
                                    </SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <DataTable columns={columns} data={reviews.data} />

                        {/* Pagination */}
                        <Pagination
                            links={reviews.links}
                            from={reviews.from}
                            to={reviews.to}
                            total={reviews.total}
                            perPage={reviews.per_page}
                            currentPath="/dashboard/product-reviews"
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
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This
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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
