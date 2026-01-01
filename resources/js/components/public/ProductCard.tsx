import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Package, ShoppingCart, Star } from 'lucide-react';

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
            minimumFractionDigits: 2,
        })
    );
}

export default function ProductCard({ product }: ProductCardProps) {
    const { auth, wishlistIds = [] } = usePage<SharedProps>().props;
    const hasDiscount =
        product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.price - product.discount_price!) / product.price) * 100,
          )
        : 0;
    const rating = Number(product.rating) || 0;
    const isInWishlist = wishlistIds.includes(product.id);
    const inStock = product.in_stock !== false;

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        router.post(
            `/wishlist/${product.id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            { preserveScroll: true },
        );
    };

    return (
        <Link href={`/product/${product.slug}`}>
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Package className="h-12 w-12" />
                        </div>
                    )}
                    {hasDiscount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
                            -{discountPercent}%
                        </Badge>
                    )}
                    {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge variant="secondary">স্টক নেই</Badge>
                        </div>
                    )}
                    <button
                        className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                            isInWishlist
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-red-500 dark:bg-card/80 dark:hover:bg-card'
                        }`}
                        onClick={handleWishlistToggle}
                    >
                        <Heart
                            className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`}
                        />
                    </button>
                </div>
                <CardContent className="p-3">
                    {product.categories && product.categories.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                            {product.categories.map((cat) => (
                                <Badge
                                    key={cat.id}
                                    variant="secondary"
                                    className="px-2 py-0.5 text-xs"
                                >
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <h3 className="line-clamp-1 text-sm font-medium group-hover:text-primary">
                        {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star
                            className={`h-3 w-3 ${rating > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`}
                        />
                        <span>{rating.toFixed(1)}</span>
                        <span>({product.reviews_count})</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-primary">
                                {formatPrice(
                                    hasDiscount
                                        ? product.discount_price!
                                        : product.price,
                                )}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>
                        {inStock && (
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
