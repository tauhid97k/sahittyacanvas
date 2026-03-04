import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Eye, Heart, MessageCircle, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    author: string;
    author_avatar: string | null;
    views: number;
    likes: number;
    comments: number;
}

interface TopPostsProps {
    posts: Post[];
}

export function TopPosts({ posts }: TopPostsProps) {
    if (posts.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Top Posts</span>
                    <Link
                        href="/dashboard/posts"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Most viewed posts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {posts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/dashboard/posts/${post.slug}`}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                {index + 1}
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                {post.author_avatar ? (
                                    <img
                                        src={post.author_avatar}
                                        alt={post.author}
                                        className="size-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="size-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {post.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {post.author}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Eye className="size-3" />
                                    <span className="text-xs">
                                        {post.views.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Heart className="size-3" />
                                    <span className="text-xs">
                                        {post.likes}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="size-3" />
                                    <span className="text-xs">
                                        {post.comments}
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
