import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

interface LowStockProduct {
    id: number;
    name: string;
    slug: string;
    stock: number;
    threshold: number;
    isOutOfStock: boolean;
}

interface LowStockAlertsProps {
    products: LowStockProduct[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-yellow-500" />
                        Low Stock Alerts
                    </span>
                    <Link
                        href="/dashboard/products?stock=low_stock"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>
                    Products running low on stock
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/dashboard/products/${product.slug}`}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Threshold: {product.threshold}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    product.isOutOfStock
                                        ? 'destructive'
                                        : 'warning'
                                }
                                className="shrink-0"
                            >
                                {product.isOutOfStock
                                    ? 'Out of Stock'
                                    : `${product.stock} left`}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
