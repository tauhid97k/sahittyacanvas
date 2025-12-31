import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Eye, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    author: string;
    author_avatar: string | null;
    status: string;
    views: number;
    created_at: string;
}

interface RecentPostsProps {
    posts: Post[];
}

const statusColors: Record<
    string,
    'default' | 'warning' | 'success' | 'destructive'
> = {
    published: 'success',
    draft: 'warning',
    pending: 'default',
};

export function RecentPosts({ posts }: RecentPostsProps) {
    if (posts.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recent Posts</span>
                    <Link
                        href="/dashboard/posts"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Latest blog posts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/dashboard/posts/${post.slug}`}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                    {post.author_avatar ? (
                                        <img
                                            src={post.author_avatar}
                                            alt={post.author}
                                            className="size-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="max-w-[200px]">
                                    <p className="truncate font-medium">
                                        {post.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {post.author}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Eye className="size-4" />
                                    <span className="text-sm">
                                        {post.views.toLocaleString()}
                                    </span>
                                </div>
                                <Badge
                                    variant={
                                        statusColors[post.status] || 'default'
                                    }
                                >
                                    {post.status}
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
