import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, MessageCircle, PenTool } from 'lucide-react';

interface BlogStatsProps {
    stats: {
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        totalViews: number;
        totalComments: number;
    };
}

export function BlogStats({ stats }: BlogStatsProps) {
    const items = [
        {
            title: 'Total Posts',
            value: stats.totalPosts.toLocaleString(),
            description: `${stats.publishedPosts} published, ${stats.draftPosts} drafts`,
            icon: FileText,
        },
        {
            title: 'Published',
            value: stats.publishedPosts.toLocaleString(),
            description: 'Live articles',
            icon: PenTool,
        },
        {
            title: 'Total Views',
            value: stats.totalViews.toLocaleString(),
            description: 'All time views',
            icon: Eye,
        },
        {
            title: 'Comments',
            value: stats.totalComments.toLocaleString(),
            description: 'Reader engagement',
            icon: MessageCircle,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
