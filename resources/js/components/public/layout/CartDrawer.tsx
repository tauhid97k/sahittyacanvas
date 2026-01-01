import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Link, router } from '@inertiajs/react';
import { Minus, Package, Plus, ShoppingBag, Trash2, User } from 'lucide-react';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total: number;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
        stock: number;
        seller: {
            id: number;
            name: string;
            username: string;
        } | null;
    } | null;
}

interface GroupedCart {
    seller: { id: number; name: string; username: string } | null;
    items: CartItem[];
    subtotal: number;
}

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
    cartItems: {
        items: CartItem[];
        grouped: GroupedCart[];
        subtotal: number;
        formatted_subtotal: string;
    };
}

function formatPrice(priceInCents: number): string {
    return (
        '৳' +
        (priceInCents / 100).toLocaleString('bn-BD', {
            minimumFractionDigits: 2,
        })
    );
}

export default function CartDrawer({
    open,
    onClose,
    cartItems,
}: CartDrawerProps) {
    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        router.put(
            `/cart/${itemId}`,
            { quantity: newQuantity },
            { preserveScroll: true },
        );
    };

    const handleRemoveItem = (itemId: number) => {
        router.delete(`/cart/${itemId}`, { preserveScroll: true });
    };

    const handleClearCart = () => {
        router.delete('/cart', { preserveScroll: true });
    };

    const isEmpty = cartItems.items.length === 0;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="flex w-full flex-col sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        কার্ট ({cartItems.items.length} পণ্য)
                    </SheetTitle>
                </SheetHeader>

                {isEmpty ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
                        <div>
                            <p className="text-lg font-medium">
                                আপনার কার্ট খালি
                            </p>
                            <p className="text-sm text-muted-foreground">
                                পণ্য যোগ করতে শপ দেখুন
                            </p>
                        </div>
                        <Button asChild onClick={onClose}>
                            <Link href="/shop">শপে যান</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {cartItems.grouped.map((group, groupIndex) => (
                                <div
                                    key={group.seller?.id ?? 'unknown'}
                                    className="mb-6"
                                >
                                    {/* Seller Header */}
                                    <Link
                                        href={
                                            group.seller
                                                ? `/@${group.seller.username}`
                                                : '#'
                                        }
                                        onClick={
                                            group.seller ? onClose : undefined
                                        }
                                        className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium">
                                                {group.seller?.name ??
                                                    'Unknown Seller'}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                বিক্রেতা প্রোফাইল দেখুন
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Items */}
                                    <div className="space-y-3">
                                        {group.items.map((item) => (
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
                                                            src={
                                                                item.product
                                                                    .image
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
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
                                                        className="line-clamp-1 text-sm font-medium hover:text-primary"
                                                    >
                                                        {item.product?.name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatPrice(
                                                            item.unit_price,
                                                        )}{' '}
                                                        × {item.quantity}
                                                    </span>
                                                    <span className="mt-auto text-sm font-semibold text-primary">
                                                        {formatPrice(
                                                            item.total,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex flex-col items-end justify-between">
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                            )
                                                        }
                                                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center rounded border bg-background hover:bg-muted"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-6 text-center text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            disabled={
                                                                !!(
                                                                    item.product &&
                                                                    item.quantity >=
                                                                        item
                                                                            .product
                                                                            .stock
                                                                )
                                                            }
                                                            className="flex h-6 w-6 items-center justify-center rounded border bg-background hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {groupIndex <
                                        cartItems.grouped.length - 1 && (
                                        <div className="mt-4 border-b" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <SheetFooter className="flex-col gap-3 border-t px-4 pt-4">
                            <div className="flex items-center justify-between text-lg font-semibold">
                                <span>মোট:</span>
                                <span className="text-primary">
                                    {cartItems.formatted_subtotal}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearCart}
                                    className="flex-1"
                                >
                                    কার্ট খালি করুন
                                </Button>
                                <Button asChild size="sm" className="flex-1">
                                    <Link href="/cart" onClick={onClose}>
                                        চেকআউট করুন
                                    </Link>
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
