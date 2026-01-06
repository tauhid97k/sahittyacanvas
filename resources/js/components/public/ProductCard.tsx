import LoginModal from '@/components/public/LoginModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Package, ShoppingBag, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    discount_type?: 'percentage' | 'flat' | null;
    discount_value?: number | null;
    image: string | null;
    categories?: ProductCategory[];
    rating: number | null;
    reviews_count: number;
    in_stock?: boolean;
}

interface SharedProps {
    auth: { user: { id: number; name: string } | null };
    wishlistIds: number[];
    [key: string]: unknown;
}

interface ProductCardProps {
    product: Product;
}

function formatPrice(priceInCents: number): string {
    return (
        '৳' +
        (priceInCents / 100).toLocaleString('bn-BD', {
            minimumFractionDigits: 0,
        })
    );
}

export default function ProductCard({ product }: ProductCardProps) {
    const { auth, wishlistIds = [] } = usePage<SharedProps>().props;
    const [showLoginModal, setShowLoginModal] = useState(false);
    const hasDiscount =
        product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.price - product.discount_price!) / product.price) * 100,
          )
        : 0;
    const discountAmount = hasDiscount
        ? product.price - product.discount_price!
        : 0;
    const rating = Number(product.rating) || 0;
    const isInWishlist = wishlistIds.includes(product.id);
    const [localIsInWishlist, setLocalIsInWishlist] = useState(isInWishlist);
    const inStock = product.in_stock !== false;

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth?.user) {
            setShowLoginModal(true);
            return;
        }
        // Optimistic update
        setLocalIsInWishlist(!localIsInWishlist);
        router.post(
            `/dashboard/wishlist/${product.id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            { preserveScroll: true },
        );
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/cart');
                },
            },
        );
    };

    return (
        <>
        <Link href={`/product/${product.slug}`}>
            <Card className="group h-full overflow-hidden bg-white transition-all hover:shadow-lg dark:bg-card">
                {/* Image Section - Fixed height 200px */}
                <div className="relative h-[200px] overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                            <Package className="size-12 text-muted-foreground/40" />
                        </div>
                    )}
                    {/* Out of Stock Overlay */}
                    {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Badge variant="secondary" className="text-sm">
                                স্টক নেই
                            </Badge>
                        </div>
                    )}
                    {/* Wishlist Button - Top Right */}
                    <button
                        className={`absolute top-2 right-2 flex size-8 items-center justify-center rounded-full shadow-md transition-all ${
                            localIsInWishlist
                                ? 'bg-primary hover:bg-primary/90'
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                        onClick={handleWishlistToggle}
                    >
                        <Heart
                            className={`size-4 ${localIsInWishlist ? 'fill-red-500 text-red-500' : ''}`}
                        />
                    </button>
                    {/* Discount Badge on Image */}
                    {hasDiscount && (
                        <Badge
                            variant="destructive"
                            className="absolute top-2 left-2 px-2 py-0.5 text-sm font-medium"
                        >
                            {product.discount_type === 'flat'
                                ? `${formatPrice(discountAmount)} ছাড়`
                                : `${discountPercent}% ছাড়`}
                        </Badge>
                    )}
                </div>

                <CardContent className="p-3">
                    {/* Categories */}
                    {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {product.categories.slice(0, 2).map((cat) => (
                                <Badge
                                    key={cat.id}
                                    variant="secondary"
                                    className="px-2 py-0.5 text-sm font-normal"
                                >
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                        {product.name}
                    </h3>

                    {/* Price & Rating Row */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                        {/* Price Section */}
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-primary">
                                {formatPrice(
                                    hasDiscount
                                        ? product.discount_price!
                                        : product.price,
                                )}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star
                                className={`size-3.5 ${rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                            <span className="text-sm font-medium">
                                {rating.toFixed(1)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {inStock && (
                        <div className="mt-3 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 flex-1 gap-1.5 text-sm"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="size-4" />
                                কার্টে যোগ করুন
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 flex-1 gap-1.5 text-sm"
                                onClick={handleBuyNow}
                            >
                                <ShoppingBag className="size-4" />
                                কিনুন
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
    );
}
