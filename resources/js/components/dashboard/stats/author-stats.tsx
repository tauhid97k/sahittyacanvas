import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, Heart, UserPlus, Users } from 'lucide-react';

interface AuthorStatsProps {
    stats: {
        followers: number;
        newFollowersThisWeek: number;
        totalLikes: number;
        totalBookmarks: number;
    };
}

export function AuthorStats({ stats }: AuthorStatsProps) {
    const items = [
        {
            title: 'Followers',
            value: stats.followers.toLocaleString(),
            description: `+${stats.newFollowersThisWeek} this week`,
            icon: Users,
        },
        {
            title: 'New Followers',
            value: stats.newFollowersThisWeek.toLocaleString(),
            description: 'This week',
            icon: UserPlus,
        },
        {
            title: 'Total Likes',
            value: stats.totalLikes.toLocaleString(),
            description: 'Across all posts',
            icon: Heart,
        },
        {
            title: 'Total Bookmarks',
            value: stats.totalBookmarks.toLocaleString(),
            description: 'Across all posts',
            icon: Bookmark,
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
                        <item.icon className="size-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-sm text-muted-foreground">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
