import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Heart, Package, ShoppingCart, Star, Trash2 } from 'lucide-react';

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
        });
    };

    const handleAddToCart = (productId: number) => {
        router.post(
            `/dashboard/cart/add`,
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'ড্যাশবোর্ড', href: '/dashboard' },
                { title: 'উইশলিস্ট', href: '/dashboard/wishlist' },
            ]}
        >
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">উইশলিস্ট</h1>
                        <p className="text-muted-foreground">
                            আপনার পছন্দের পণ্যগুলো
                        </p>
                    </div>
                    {products.data.length > 0 && (
                        <Badge variant="secondary">
                            {products.data.length} টি পণ্য
                        </Badge>
                    )}
                </div>

                {products.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard
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
                            উইশলিস্ট খালি
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            আপনার পছন্দের পণ্যগুলো এখানে যোগ করুন
                        </p>
                        <Link href="/shop">
                            <Button className="mt-4">কেনাকাটা করুন</Button>
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

function ProductCard({
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
        <Card className="group h-full overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Link href={`/product/${product.slug}`}>
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
                </Link>
                {hasDiscount && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                        -{discountPercent}%
                    </Badge>
                )}
                {!product.in_stock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Badge variant="secondary">স্টক নেই</Badge>
                    </div>
                )}
                <button
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 transition-colors hover:bg-red-50"
                    onClick={onRemove}
                    title="উইশলিস্ট থেকে সরান"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <CardContent className="p-3">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="line-clamp-1 text-sm font-medium hover:text-primary">
                        {product.name}
                    </h3>
                </Link>
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
                    {product.in_stock && (
                        <button
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                            onClick={onAddToCart}
                            title="কার্টে যোগ করুন"
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
