import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Link, router } from '@inertiajs/react';
import { Heart, Package, ShoppingCart, Trash2 } from 'lucide-react';

interface WishlistItem {
    id: number;
    product_id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
        price: number;
        discount_price: number | null;
        in_stock: boolean;
    } | null;
}

interface WishlistDrawerProps {
    open: boolean;
    onClose: () => void;
    wishlistItems: WishlistItem[];
}

function formatPrice(priceInCents: number): string {
    return (
        '৳' +
        (priceInCents / 100).toLocaleString('bn-BD', {
            minimumFractionDigits: 0,
        })
    );
}

export default function WishlistDrawer({
    open,
    onClose,
    wishlistItems,
}: WishlistDrawerProps) {
    const handleRemoveItem = (productId: number) => {
        router.post(
            `/wishlist/${productId}/toggle`,
            {},
            { preserveScroll: true }
        );
    };

    const handleAddToCart = (productId: number) => {
        router.post(
            '/cart',
            { product_id: productId, quantity: 1 },
            { preserveScroll: true }
        );
    };

    const handleAddAllToCart = () => {
        wishlistItems.forEach((item) => {
            if (item.product?.in_stock) {
                router.post(
                    '/cart',
                    { product_id: item.product_id, quantity: 1 },
                    { preserveScroll: true }
                );
            }
        });
    };

    const isEmpty = wishlistItems.length === 0;
    const hasInStockItems = wishlistItems.some((item) => item.product?.in_stock);

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="flex w-full flex-col sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        উইশলিস্ট ({wishlistItems.length} পণ্য)
                    </SheetTitle>
                </SheetHeader>

                {isEmpty ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                        <Heart className="h-16 w-16 text-muted-foreground/50" />
                        <div>
                            <p className="text-lg font-medium">
                                আপনার উইশলিস্ট খালি
                            </p>
                            <p className="text-sm text-muted-foreground">
                                পছন্দের পণ্য যোগ করতে শপ দেখুন
                            </p>
                        </div>
                        <Button asChild onClick={onClose}>
                            <Link href="/shop">শপে যান</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-3">
                                {wishlistItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 rounded-lg border bg-card p-3"
                                    >
                                        {/* Product Image */}
                                        <Link
                                            href={`/product/${item.product?.slug}`}
                                            onClick={onClose}
                                            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                                        >
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Product Details */}
                                        <div className="flex flex-1 flex-col">
                                            <Link
                                                href={`/product/${item.product?.slug}`}
                                                onClick={onClose}
                                                className="line-clamp-2 text-sm font-medium hover:text-primary"
                                            >
                                                {item.product?.name}
                                            </Link>
                                            <div className="mt-1 flex items-center gap-2">
                                                {item.product?.discount_price ? (
                                                    <>
                                                        <span className="text-sm font-semibold text-primary">
                                                            {formatPrice(item.product.discount_price)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            {formatPrice(item.product.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-semibold text-primary">
                                                        {formatPrice(item.product?.price ?? 0)}
                                                    </span>
                                                )}
                                            </div>
                                            {!item.product?.in_stock && (
                                                <span className="mt-1 text-xs text-destructive">
                                                    স্টকে নেই
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => handleRemoveItem(item.product_id)}
                                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                title="উইশলিস্ট থেকে সরান"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            {item.product?.in_stock && (
                                                <button
                                                    onClick={() => handleAddToCart(item.product_id)}
                                                    className="rounded p-1.5 text-primary hover:bg-primary/10"
                                                    title="কার্টে যোগ করুন"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <SheetFooter className="flex-col gap-3 border-t pt-4">
                            {hasInStockItems && (
                                <Button
                                    onClick={handleAddAllToCart}
                                    className="w-full gap-2"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    সব কার্টে যোগ করুন
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                asChild
                                className="w-full"
                                onClick={onClose}
                            >
                                <Link href="/shop">শপিং চালিয়ে যান</Link>
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
