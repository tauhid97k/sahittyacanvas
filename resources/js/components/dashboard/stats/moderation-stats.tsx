import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { FileText, MessageCircle, Package } from 'lucide-react';

interface ModerationStatsProps {
    stats: {
        pendingPosts: number;
        pendingComments: number;
        pendingProducts: number;
    };
}

export function ModerationStats({ stats }: ModerationStatsProps) {
    const total =
        stats.pendingPosts + stats.pendingComments + stats.pendingProducts;

    const items = [
        {
            title: 'Pending Posts',
            value: stats.pendingPosts,
            icon: FileText,
            tab: 'posts',
        },
        {
            title: 'Pending Comments',
            value: stats.pendingComments,
            icon: MessageCircle,
            tab: 'comments',
        },
        {
            title: 'Pending Products',
            value: stats.pendingProducts,
            icon: Package,
            tab: 'products',
        },
    ];

    if (total === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Moderation Queue</span>
                    <Link
                        href="/dashboard/moderation"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {items.map((item) => (
                        <Link
                            key={item.title}
                            href={`/dashboard/moderation?tab=${item.tab}`}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                <item.icon className="size-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {item.value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
