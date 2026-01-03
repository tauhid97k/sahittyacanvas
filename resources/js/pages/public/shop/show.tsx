import LoginModal from '@/components/public/LoginModal';
import PublicLayout from '@/components/public/layout/PublicLayout';
import ProductCard from '@/components/public/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

interface Image {
    id: number;
    url: string;
    thumb: string;
    medium: string;
}

interface Category {
    id: number;
    name_bn: string;
    slug: string;
}

interface Seller {
    id: number;
    name: string;
    avatar: string | null;
    username: string;
}

interface Review {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    is_verified: boolean;
    user: { id: number; name: string; avatar: string | null };
    created_at: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount_price: number | null;
    discount_ends_at: string | null;
    stock: number;
    sku: string | null;
    images: Image[];
    seller: Seller;
    categories: Category[];
    rating: number;
    reviews_count: number;
    reviews: Review[];
    views_count: number;
    sales_count: number;
}

interface RelatedProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    image: string | null;
    rating: number | null;
    reviews_count: number;
    in_stock?: boolean;
}

interface SharedProps {
    auth: { user: { id: number; name: string } | null };
    wishlistIds?: number[];
    [key: string]: unknown;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface Props {
    product: Product;
    relatedProducts: RelatedProduct[];
    breadcrumb: BreadcrumbItemType[];
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ProductShow({
    product,
    relatedProducts,
    breadcrumb,
}: Props) {
    const { auth, wishlistIds = [] } = usePage<SharedProps>().props;
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const isInWishlist = wishlistIds.includes(product.id);

    const hasDiscount =
        product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.discount_price! / product.price) * 100)
        : 0;
    const currentPrice = hasDiscount ? product.discount_price! : product.price;
    const inStock = product.stock > 0;

    const handleAddToCart = () => {
        setProcessing(true);
        router.post('/cart', { product_id: product.id, quantity }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const handleBuyNow = () => {
        setProcessing(true);
        router.post('/cart', { product_id: product.id, quantity }, {
            preserveScroll: true,
            onSuccess: () => router.visit('/checkout'),
            onFinish: () => setProcessing(false),
        });
    };

    const handleWishlistToggle = () => {
        if (!auth?.user) {
            setShowLoginModal(true);
            return;
        }
        router.post(`/dashboard/wishlist/${product.id}/toggle`, {}, { preserveScroll: true });
    };

    return (
        <PublicLayout
            title={product.name}
            description={product.description || undefined}
        >
            <div className="container py-8">
                {/* Breadcrumb - Simple inline style */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumb.map((item, index) => (
                        <span key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-4 w-4" />}
                            {index === breadcrumb.length - 1 ? (
                                <span className="text-foreground">{item.title}</span>
                            ) : (
                                <Link href={item.href} className="hover:text-primary">
                                    {item.title}
                                </Link>
                            )}
                        </span>
                    ))}
                </nav>

                {/* Product Details */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Images */}
                    <div>
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                            {product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage]?.url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-6xl text-muted-foreground">
                                    📦
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                {product.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                                            selectedImage === index
                                                ? 'border-primary'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <img
                                            src={image.thumb}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        {/* Categories */}
                        <div className="mb-2 flex flex-wrap gap-2">
                            {product.categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/product-category/${cat.slug}`}
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    {cat.name_bn}
                                </Link>
                            ))}
                        </div>

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.reviews_count > 0 &&
                            product.rating != null && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-5 w-5 ${
                                                    star <=
                                                    Number(product.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        ({product.reviews_count} রিভিউ)
                                    </span>
                                </div>
                            )}

                        {/* Price */}
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(currentPrice)}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-xl text-muted-foreground line-through">
                                        {formatPrice(product.price)}
                                    </span>
                                    <Badge className="bg-red-500">
                                        -{discountPercent}%
                                    </Badge>
                                </>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mt-4">
                            {inStock ? (
                                <Badge
                                    variant="outline"
                                    className="text-green-600"
                                >
                                    স্টকে আছে ({product.stock} টি)
                                </Badge>
                            ) : (
                                <Badge variant="destructive">স্টক নেই</Badge>
                            )}
                        </div>

                        <Separator className="my-6" />

                        {/* Quantity & Add to Cart */}
                        {inStock && (
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center rounded-md border">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setQuantity(
                                                Math.min(
                                                    product.stock,
                                                    quantity + 1,
                                                ),
                                            )
                                        }
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={handleAddToCart}
                                    disabled={processing}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    কার্টে যোগ করুন
                                </Button>
                                <Button
                                    size="lg"
                                    className="gap-2"
                                    onClick={handleBuyNow}
                                    disabled={processing}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    এখনই কিনুন
                                </Button>
                                <Button
                                    size="lg"
                                    variant={isInWishlist ? 'default' : 'outline'}
                                    className="gap-2"
                                    onClick={handleWishlistToggle}
                                >
                                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                    {isInWishlist ? 'পছন্দে আছে' : 'পছন্দে যোগ করুন'}
                                </Button>
                            </div>
                        )}

                        <Separator className="my-6" />

                        {/* Seller */}
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage
                                    src={product.seller.avatar || undefined}
                                />
                                <AvatarFallback>
                                    {product.seller.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    বিক্রেতা
                                </p>
                                <Link
                                    href={`/@${product.seller.username}`}
                                    className="font-medium hover:text-primary"
                                >
                                    {product.seller.name}
                                </Link>
                            </div>
                        </div>

                        {/* SKU */}
                        {product.sku && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                SKU: {product.sku}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div className="mt-12">
                        <h2 className="mb-4 text-xl font-bold">বিবরণ</h2>
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: product.description,
                            }}
                        />
                    </div>
                )}

                {/* Reviews */}
                <div className="mt-12">
                    <h2 className="mb-6 text-xl font-bold">
                        রিভিউ ({product.reviews_count})
                    </h2>

                    {product.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {product.reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            এখনো কোনো রিভিউ নেই
                        </p>
                    )}
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-6 text-xl font-bold">
                            সম্পর্কিত পণ্য
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={{
                                        id: p.id,
                                        name: p.name,
                                        slug: p.slug,
                                        price: p.price,
                                        discount_price: p.discount_price,
                                        image: p.image,
                                        rating: p.rating,
                                        reviews_count: p.reviews_count,
                                        in_stock: p.in_stock,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </PublicLayout>
    );
}

function ReviewCard({ review }: { review: Review }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar>
                        <AvatarImage src={review.user.avatar || undefined} />
                        <AvatarFallback>
                            {review.user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium">
                                    {review.user.name}
                                </span>
                                {review.is_verified && (
                                    <Badge variant="secondary" className="ml-2">
                                        যাচাইকৃত ক্রেতা
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                        star <= review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground'
                                    }`}
                                />
                            ))}
                        </div>
                        {review.title && (
                            <p className="mt-2 font-medium">{review.title}</p>
                        )}
                        {review.comment && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {review.comment}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

