import PublicLayout from '@/components/public/layout/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Search, Star } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    image: string | null;
    seller: { id: number; name: string };
    category: { name: string; slug: string } | null;
    rating: number;
    reviews_count: number;
    in_stock: boolean;
}

interface Category {
    id: number;
    name_bn: string;
    slug: string;
    products_count: number;
}

interface Props {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: {
        search: string | null;
        category: string | null;
        sort: string;
        min_price: string | null;
        max_price: string | null;
    };
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

export default function ShopIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/shop', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string | null) => {
        router.get(
            '/shop',
            { ...filters, [key]: value },
            { preserveState: true },
        );
    };

    return (
        <PublicLayout
            title="কেনাকাটা"
            description="সাহিত্য ক্যানভাসের পণ্য সংগ্রহ"
        >
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">কেনাকাটা করুন</h1>
                    <p className="mt-2 text-muted-foreground">
                        আমাদের বিশেষ পণ্য সংগ্রহ থেকে বেছে নিন
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="পণ্য খুঁজুন..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            খুঁজুন
                        </Button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange(
                                    'category',
                                    v === 'all' ? null : v,
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="বিভাগ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">সব বিভাগ</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.slug}>
                                        {cat.name_bn} ({cat.products_count})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="সাজান" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">
                                    সাম্প্রতিক
                                </SelectItem>
                                <SelectItem value="popular">
                                    জনপ্রিয়
                                </SelectItem>
                                <SelectItem value="price_low">
                                    দাম: কম থেকে বেশি
                                </SelectItem>
                                <SelectItem value="price_high">
                                    দাম: বেশি থেকে কম
                                </SelectItem>
                                <SelectItem value="rating">
                                    সর্বোচ্চ রেটিং
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Products Grid */}
                {products.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <p className="text-lg text-muted-foreground">
                            কোনো পণ্য পাওয়া যায়নি
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
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
        </PublicLayout>
    );
}

function ProductCard({ product }: { product: Product }) {
    const hasDiscount =
        product.discount_price && product.discount_price < product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.discount_price! / product.price) * 100)
        : 0;

    return (
        <Link href={`/product/${product.slug}`}>
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                            📦
                        </div>
                    )}
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
                </div>
                <CardContent className="p-4">
                    {product.category && (
                        <span className="mb-2 inline-block text-xs text-muted-foreground">
                            {product.category.name}
                        </span>
                    )}
                    <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                        {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
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
                    {product.reviews_count > 0 && product.rating != null && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{Number(product.rating).toFixed(1)}</span>
                            <span className="text-muted-foreground">
                                ({product.reviews_count})
                            </span>
                        </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        বিক্রেতা: {product.seller.name}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
