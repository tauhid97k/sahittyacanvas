import PublicLayout from '@/components/public/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote, Check, CreditCard, Package, ShoppingBag, Store, Truck } from 'lucide-react';

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

interface Props {
    cart: {
        items: CartItem[];
        grouped: GroupedCart[];
        subtotal: number;
        formatted_subtotal: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

function formatPrice(priceInCents: number): string {
    return (
        '৳' +
        (priceInCents / 100).toLocaleString('bn-BD', {
            minimumFractionDigits: 0,
        })
    );
}

export default function Checkout({ cart, user }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };

    const { data, setData, post, processing } = useForm({
        // Account fields (for guests)
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        // Shipping fields
        shipping_name: user?.name || '',
        shipping_phone: '',
        shipping_email: user?.email || '',
        shipping_address: '',
        shipping_city: '',
        shipping_area: '',
        shipping_postal_code: '',
        buyer_notes: '',
        payment_method: 'cod',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout');
    };

    const isEmpty = cart.items.length === 0;

    if (isEmpty) {
        return (
            <PublicLayout>
                <Head title="চেকআউট" />
                <div className="container py-12">
                    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
                        <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
                        <div>
                            <h1 className="text-2xl font-bold">আপনার কার্ট খালি</h1>
                            <p className="mt-2 text-muted-foreground">
                                চেকআউট করতে প্রথমে কার্টে পণ্য যোগ করুন
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/shop">শপে যান</Link>
                        </Button>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title="চেকআউট" />
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/shop"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        শপিং চালিয়ে যান
                    </Link>
                    <h1 className="text-2xl font-bold lg:text-3xl">চেকআউট</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column - Forms */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Account Section (for guests) */}
                            {!user && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            অ্যাকাউন্ট তথ্য
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            অর্ডার ট্র্যাক করতে একটি অ্যাকাউন্ট তৈরি হবে
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="email">ইমেইল *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="your@email.com"
                                                className="mt-1"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor="password">পাসওয়ার্ড *</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="••••••••"
                                                    className="mt-1"
                                                />
                                                {errors.password && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="password_confirmation">পাসওয়ার্ড নিশ্চিত করুন *</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="••••••••"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                                            <Link href="/login" className="text-primary hover:underline">
                                                লগইন করুন
                                            </Link>
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        ডেলিভারি ঠিকানা
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="shipping_name">নাম *</Label>
                                            <Input
                                                id="shipping_name"
                                                value={data.shipping_name}
                                                onChange={(e) => setData('shipping_name', e.target.value)}
                                                placeholder="আপনার নাম"
                                                className="mt-1"
                                            />
                                            {errors.shipping_name && (
                                                <p className="mt-1 text-sm text-destructive">{errors.shipping_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="shipping_phone">ফোন নম্বর *</Label>
                                            <Input
                                                id="shipping_phone"
                                                value={data.shipping_phone}
                                                onChange={(e) => setData('shipping_phone', e.target.value)}
                                                placeholder="01XXXXXXXXX"
                                                className="mt-1"
                                            />
                                            {errors.shipping_phone && (
                                                <p className="mt-1 text-sm text-destructive">{errors.shipping_phone}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="shipping_email">ইমেইল (ঐচ্ছিক)</Label>
                                        <Input
                                            id="shipping_email"
                                            type="email"
                                            value={data.shipping_email}
                                            onChange={(e) => setData('shipping_email', e.target.value)}
                                            placeholder="your@email.com"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="shipping_address">সম্পূর্ণ ঠিকানা *</Label>
                                        <Textarea
                                            id="shipping_address"
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            placeholder="বাড়ি নং, রাস্তা, এলাকা..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                        {errors.shipping_address && (
                                            <p className="mt-1 text-sm text-destructive">{errors.shipping_address}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <Label htmlFor="shipping_city">শহর *</Label>
                                            <Input
                                                id="shipping_city"
                                                value={data.shipping_city}
                                                onChange={(e) => setData('shipping_city', e.target.value)}
                                                placeholder="ঢাকা"
                                                className="mt-1"
                                            />
                                            {errors.shipping_city && (
                                                <p className="mt-1 text-sm text-destructive">{errors.shipping_city}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="shipping_area">এলাকা</Label>
                                            <Input
                                                id="shipping_area"
                                                value={data.shipping_area}
                                                onChange={(e) => setData('shipping_area', e.target.value)}
                                                placeholder="মিরপুর"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="shipping_postal_code">পোস্ট কোড</Label>
                                            <Input
                                                id="shipping_postal_code"
                                                value={data.shipping_postal_code}
                                                onChange={(e) => setData('shipping_postal_code', e.target.value)}
                                                placeholder="1216"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="buyer_notes">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                                        <Textarea
                                            id="buyer_notes"
                                            value={data.buyer_notes}
                                            onChange={(e) => setData('buyer_notes', e.target.value)}
                                            placeholder="ডেলিভারি সম্পর্কে কোনো বিশেষ নির্দেশনা..."
                                            className="mt-1"
                                            rows={2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Banknote className="h-5 w-5" />
                                        পেমেন্ট পদ্ধতি
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <label
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                                                data.payment_method === 'cod' ? 'border-primary bg-primary/5' : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="cod"
                                                checked={data.payment_method === 'cod'}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="h-4 w-4 text-primary"
                                            />
                                            <Banknote className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">ক্যাশ অন ডেলিভারি</p>
                                                <p className="text-sm text-muted-foreground">
                                                    পণ্য হাতে পেয়ে টাকা দিন
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.payment_method && (
                                        <p className="mt-2 text-sm text-destructive">{errors.payment_method}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5" />
                                        অর্ডার সারাংশ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Items by Seller */}
                                    {cart.grouped.map((group) => (
                                        <div key={group.seller?.id ?? 'unknown'} className="space-y-3">
                                            {/* Seller Header */}
                                            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm">
                                                <Store className="h-4 w-4 text-primary" />
                                                <span className="font-medium">
                                                    {group.seller?.name ?? 'বিক্রেতা'}
                                                </span>
                                            </div>
                                            {/* Items */}
                                            <div className="space-y-2">
                                                {group.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                                            {item.product?.image ? (
                                                                <img
                                                                    src={item.product.image}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-sm font-medium">
                                                                {item.product?.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatPrice(item.unit_price)} × {item.quantity}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {formatPrice(item.total)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-b" />
                                        </div>
                                    ))}

                                    {/* Totals */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">সাবটোটাল</span>
                                            <span>{cart.formatted_subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                                            <span>৳০</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>মোট</span>
                                                <span className="text-primary">{cart.formatted_subtotal}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full gap-2"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            'প্রক্রিয়াকরণ হচ্ছে...'
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                অর্ডার কনফার্ম করুন
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-center text-xs text-muted-foreground">
                                        অর্ডার করে আপনি আমাদের{' '}
                                        <Link href="/terms" className="text-primary hover:underline">
                                            শর্তাবলী
                                        </Link>{' '}
                                        মেনে নিচ্ছেন
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
