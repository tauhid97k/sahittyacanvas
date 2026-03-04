import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Eye, ShoppingCart } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    slug: string;
    seller: string;
    price: string;
    sales: number;
    views: number;
}

interface TopProductsProps {
    products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Top Products</span>
                    <Link
                        href="/dashboard/products"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Best selling products</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            href={`/dashboard/products/${product.slug}`}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {product.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {product.price} · {product.seller}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <ShoppingCart className="size-3" />
                                    <span className="text-xs">
                                        {product.sales}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="size-3" />
                                    <span className="text-xs">
                                        {product.views}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
