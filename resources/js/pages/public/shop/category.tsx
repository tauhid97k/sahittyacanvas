import PublicLayout from '@/components/public/layout/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import { Star } from 'lucide-react';

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
}

interface Category {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    description: string | null;
    image: string | null;
}

interface Subcategory {
    id: number;
    name_bn: string;
    slug: string;
    products_count: number;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface Props {
    category: Category;
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    subcategories: Subcategory[];
    breadcrumb: BreadcrumbItemType[];
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

export default function ProductCategoryPage({
    category,
    products,
    subcategories,
    breadcrumb,
}: Props) {
    return (
        <PublicLayout
            title={category.name_bn}
            description={
                category.description || `${category.name_bn} বিভাগের সকল পণ্য`
            }
        >
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-background py-12">
                {category.image && (
                    <div className="absolute inset-0 opacity-10">
                        <img
                            src={category.image}
                            alt={category.name_bn}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative container">
                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            {breadcrumb.map((item, index) => (
                                <BreadcrumbItem key={index}>
                                    {index === breadcrumb.length - 1 ? (
                                        <BreadcrumbPage>
                                            {item.title}
                                        </BreadcrumbPage>
                                    ) : (
                                        <>
                                            <BreadcrumbLink href={item.href}>
                                                {item.title}
                                            </BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                        </>
                                    )}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        {category.name_bn}
                    </h1>
                    {category.name_en && (
                        <p className="mt-1 text-lg text-muted-foreground">
                            {category.name_en}
                        </p>
                    )}
                    {category.description && (
                        <p className="mt-4 max-w-2xl text-muted-foreground">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="container py-8">
                {/* Subcategories */}
                {subcategories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold">
                            উপ-বিভাগসমূহ
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub.id}
                                    href={`/product-category/${sub.slug}`}
                                    className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                >
                                    {sub.name_bn} ({sub.products_count})
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

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
                            এই বিভাগে কোনো পণ্য পাওয়া যায়নি
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
