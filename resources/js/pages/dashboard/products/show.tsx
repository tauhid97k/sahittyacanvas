import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoImage } from '@/components/ui/no-image';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Product } from '@/types/models';
import { PaginatedData } from '@/types/pagination';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    DollarSign,
    Eye,
    Info,
    Package,
    Pencil,
    ShoppingCart,
    Star,
    User,
    Zap,
} from 'lucide-react';

interface ReviewWithUser {
    id: number;
    rating: number;
    review: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        username?: string;
        avatar?: string;
        roles?: { id: number; name: string }[];
    };
}

interface Props {
    product: Product & {
        total_revenue?: number;
        formatted_total_revenue?: string;
        seller?: {
            id: number;
            name: string;
            username?: string;
            avatar?: string;
            roles?: { id: number; name: string }[];
        };
    };
    reviews: PaginatedData<ReviewWithUser>;
}

const statusColors: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    draft: 'secondary',
    published: 'default',
    archived: 'outline',
};

const moderationColors: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    auto: 'secondary',
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
};

function StarRating({
    rating,
    size = 'sm',
}: {
    rating: number;
    size?: 'sm' | 'lg';
}) {
    const sizeClass = size === 'lg' ? 'size-5' : 'size-4';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ShowProduct({ product, reviews }: Props) {
    const truncateTitle = (title: string, maxLength: number = 30) => {
        return title.length > maxLength
            ? title.slice(0, maxLength) + '...'
            : title;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/dashboard/products' },
        {
            title: truncateTitle(product.name_en || product.name_bn),
            href: `/dashboard/products/${product.slug}`,
        },
    ];

    // Stock status
    const isLowStock =
        product.stock_count > 0 &&
        product.stock_count <= product.stock_alert_threshold;
    const isOutOfStock = product.stock_count === 0;

    // All images (featured + gallery)
    const allImages = [
        ...(product.featured_image_url ? [product.featured_image_url] : []),
        ...(product.image_urls || []),
    ];

    // Stats data
    const stats = [
        {
            title: 'Total Sales',
            value: product.sales_count ?? 0,
            icon: ShoppingCart,
            description: 'Units sold',
        },
        {
            title: 'Total Views',
            value: product.views_count ?? 0,
            icon: Eye,
            description: 'Product views',
        },
        {
            title: 'Revenue',
            value: product.formatted_total_revenue || '৳0.00',
            icon: DollarSign,
            description: 'Total earnings',
            isPrice: true,
        },
        {
            title: 'Stock',
            value: product.stock_count,
            icon: Package,
            description: isOutOfStock
                ? 'Out of stock'
                : isLowStock
                  ? 'Low stock'
                  : 'In stock',
            variant: isOutOfStock
                ? 'destructive'
                : isLowStock
                  ? 'warning'
                  : 'default',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name_bn || product.name_en || 'Product'} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/products">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">
                            {product.name_bn}
                        </h1>
                        {product.name_en && (
                            <p className="text-sm text-muted-foreground">
                                {product.name_en}
                            </p>
                        )}
                    </div>
                    <Button asChild>
                        <Link href={`/dashboard/products/${product.slug}/edit`}>
                            <Pencil />
                            Edit Product
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.isPrice
                                        ? stat.value
                                        : stat.value.toLocaleString()}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Images & Info Card */}
                        <Card>
                            <CardContent className="p-6">
                                {/* Images Section - All same size in horizontal grid */}
                                <div className="mb-6">
                                    {allImages.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                            {allImages.map((url, index) => (
                                                <div
                                                    key={index}
                                                    className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${product.name_bn} - ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {index === 0 && (
                                                        <Badge className="absolute top-1 left-1 text-xs">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted">
                                            <NoImage className="size-12" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div>
                                    {/* Categories */}
                                    {product.categories &&
                                        product.categories.length > 0 && (
                                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    Categories:
                                                </span>
                                                {product.categories.map(
                                                    (category) => (
                                                        <Badge
                                                            key={category.id}
                                                            variant="secondary"
                                                        >
                                                            {category.name_bn}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {/* Pricing */}
                                    <div className="mb-4">
                                        {product.discount_percentage ? (
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-2xl font-bold text-primary">
                                                    {
                                                        product.formatted_discounted_price
                                                    }
                                                </span>
                                                <span className="text-lg text-muted-foreground line-through">
                                                    {product.formatted_price}
                                                </span>
                                                <Badge variant="destructive">
                                                    -
                                                    {
                                                        product.discount_percentage
                                                    }
                                                    %
                                                </Badge>
                                            </div>
                                        ) : (
                                            <span className="text-2xl font-bold">
                                                {product.formatted_price}
                                            </span>
                                        )}
                                    </div>

                                    {/* Meta Info */}
                                    <div className="mb-4 space-y-1 text-sm">
                                        {product.sku && (
                                            <div>
                                                <span className="font-medium">
                                                    SKU:
                                                </span>{' '}
                                                <span className="text-muted-foreground">
                                                    {product.sku}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">
                                                Created:
                                            </span>{' '}
                                            <span className="text-muted-foreground">
                                                {format(
                                                    new Date(
                                                        product.created_at,
                                                    ),
                                                    'MMM d, yyyy',
                                                )}
                                            </span>
                                        </div>
                                        {product.published_at && (
                                            <div>
                                                <span className="font-medium">
                                                    Published:
                                                </span>{' '}
                                                <span className="text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            product.published_at,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {product.description && (
                                        <div className="border-t pt-4">
                                            <div
                                                className="prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: product.description,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="size-5" />
                                    Reviews
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Rating Summary */}
                                <div className="mb-6 flex flex-col gap-6 sm:flex-row">
                                    {/* Average Rating */}
                                    <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4">
                                        <span className="text-4xl font-bold">
                                            {product.average_rating?.toFixed(
                                                1,
                                            ) || '0.0'}
                                        </span>
                                        <StarRating
                                            rating={Math.round(
                                                product.average_rating || 0,
                                            )}
                                            size="lg"
                                        />
                                        <span className="mt-1 text-sm text-muted-foreground">
                                            {product.review_count || 0} reviews
                                        </span>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count =
                                                product.rating_distribution?.[
                                                    star
                                                ] || 0;
                                            const total =
                                                product.review_count || 0;
                                            const percentage =
                                                total > 0
                                                    ? (count / total) * 100
                                                    : 0;
                                            return (
                                                <div
                                                    key={star}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="w-3 text-sm">
                                                        {star}
                                                    </span>
                                                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                                    <div className="h-2 flex-1 rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-yellow-400"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-8 text-right text-sm text-muted-foreground">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                {reviews.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.data.map((review) => (
                                            <div
                                                key={review.id}
                                                className="border-t pt-4 first:border-t-0 first:pt-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                                        {review.user.avatar ? (
                                                            <img
                                                                src={
                                                                    review.user
                                                                        .avatar
                                                                }
                                                                alt={
                                                                    review.user
                                                                        .name
                                                                }
                                                                className="size-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="size-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        review
                                                                            .user
                                                                            .name
                                                                    }
                                                                </p>
                                                                <StarRating
                                                                    rating={
                                                                        review.rating
                                                                    }
                                                                />
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(
                                                                    new Date(
                                                                        review.created_at,
                                                                    ),
                                                                    'MMM d, yyyy',
                                                                )}
                                                            </span>
                                                        </div>
                                                        {review.review && (
                                                            <p className="mt-2 text-sm">
                                                                {review.review}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground">
                                        No reviews yet
                                    </p>
                                )}

                                {/* Pagination */}
                                {reviews.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            links={reviews.links}
                                            from={reviews.from}
                                            to={reviews.to}
                                            total={reviews.total}
                                            perPage={reviews.per_page}
                                            currentPath={`/dashboard/products/${product.slug}`}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="size-5" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link
                                        href={`/dashboard/products/${product.slug}/edit`}
                                    >
                                        <Pencil />
                                        Edit Product
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link
                                        href={`/products/${product.slug}`}
                                        target="_blank"
                                    >
                                        <Eye />
                                        View Public Page
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Status & Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="size-5" />
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Status</span>
                                    <Badge
                                        variant={statusColors[product.status]}
                                    >
                                        {product.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            product.status.slice(1)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Moderation
                                    </span>
                                    <Badge
                                        variant={
                                            moderationColors[
                                                product.moderation_status
                                            ]
                                        }
                                    >
                                        {product.moderation_status === 'auto' &&
                                            'Auto'}
                                        {product.moderation_status ===
                                            'pending' && 'Pending'}
                                        {product.moderation_status ===
                                            'approved' && 'Approved'}
                                        {product.moderation_status ===
                                            'rejected' && 'Rejected'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Current Stock
                                    </span>
                                    <Badge
                                        variant={
                                            isOutOfStock
                                                ? 'destructive'
                                                : isLowStock
                                                  ? 'destructive'
                                                  : 'secondary'
                                        }
                                    >
                                        {product.stock_count} units
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Low Stock Alert
                                    </span>
                                    <span className="text-sm">
                                        {product.stock_alert_threshold} units
                                    </span>
                                </div>
                                {product.sku && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">SKU</span>
                                        <span className="text-sm">
                                            {product.sku}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Seller Card */}
                        {product.seller && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="size-5" />
                                        Seller
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            {product.seller.avatar ? (
                                                <img
                                                    src={product.seller.avatar}
                                                    alt={product.seller.name}
                                                    className="size-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="size-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {product.seller.name}
                                            </p>
                                            {product.seller.username && (
                                                <p className="text-sm text-muted-foreground">
                                                    @{product.seller.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {product.seller.roles &&
                                        product.seller.roles.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {product.seller.roles.map(
                                                    (role) => (
                                                        <Badge
                                                            key={role.id}
                                                            variant="outline"
                                                        >
                                                            {role.name}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full"
                                        asChild
                                    >
                                        <Link
                                            href={`/dashboard/users/${product.seller.id}`}
                                        >
                                            View Seller Profile
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
