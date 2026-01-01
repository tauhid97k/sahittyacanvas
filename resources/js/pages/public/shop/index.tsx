import PublicLayout from '@/components/public/layout/PublicLayout';
import ProductCard from '@/components/public/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    image: string | null;
    categories?: { id: number; name: string; slug: string }[];
    rating: number | null;
    reviews_count: number;
    in_stock?: boolean;
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
