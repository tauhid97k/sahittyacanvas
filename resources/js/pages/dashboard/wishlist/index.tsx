import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Heart, Package, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    image: string | null;
    seller: { id: number; name: string };
    rating: number;
    reviews_count: number;
    in_stock: boolean;
    added_at: string;
}

interface Props {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

export default function WishlistIndex({ products }: Props) {
    const handleRemove = (productId: number) => {
        router.delete(`/dashboard/wishlist/${productId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Removed from wishlist');
            },
        });
    };

    const handleAddToCart = (productId: number) => {
        router.post(
            '/cart',
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Added to cart');
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Wishlist', href: '/dashboard/wishlist' },
            ]}
        >
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Wishlist</h1>
                        <p className="text-muted-foreground">
                            Your favorite products
                        </p>
                    </div>
                    {products.data.length > 0 && (
                        <Badge variant="secondary">
                            {products.data.length} items
                        </Badge>
                    )}
                </div>

                {products.data.length > 0 ? (
                    <div className="space-y-3">
                        {products.data.map((product) => (
                            <WishlistItem
                                key={product.id}
                                product={product}
                                onRemove={() => handleRemove(product.id)}
                                onAddToCart={() => handleAddToCart(product.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Heart className="mx-auto h-16 w-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-lg font-semibold">
                            Your wishlist is empty
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Add your favorite products here
                        </p>
                        <Link href="/shop">
                            <Button className="mt-4">Go Shopping</Button>
                        </Link>
                    </div>
                )}

                {products.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {products.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function WishlistItem({
    product,
    onRemove,
    onAddToCart,
}: {
    product: Product;
    onRemove: () => void;
    onAddToCart: () => void;
}) {
    const hasDiscount =
        product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.price - product.discount_price!) / product.price) * 100,
          )
        : 0;
    const rating = Number(product.rating) || 0;

    return (
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
            {/* Product Image */}
            <Link
                href={`/product/${product.slug}`}
                className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted"
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                {hasDiscount && (
                    <Badge className="absolute -top-1 -left-1 bg-red-500 px-1.5 py-0.5 text-xs">
                        -{discountPercent}%
                    </Badge>
                )}
            </Link>

            {/* Product Info */}
            <div className="flex flex-1 flex-col gap-1">
                <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-1 font-medium hover:text-primary"
                >
                    {product.name}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star
                            className={`h-3.5 w-3.5 ${rating > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`}
                        />
                        <span>{rating.toFixed(1)}</span>
                        <span>({product.reviews_count} reviews)</span>
                    </div>
                    {!product.in_stock && (
                        <Badge variant="destructive" className="text-xs">
                            Out of stock
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                        {formatPrice(
                            hasDiscount ? product.discount_price! : product.price,
                        )}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {product.in_stock && (
                    <Button
                        size="sm"
                        onClick={onAddToCart}
                        className="gap-1.5"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRemove}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
