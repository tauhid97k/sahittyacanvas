import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Bookmark, BookOpen, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    author: { id: number; name: string };
    categories: Category[];
    published_at: string | null;
}

interface BookmarkItem {
    id: number;
    post_id: number;
    post: Post | null;
    created_at: string;
}

interface Props {
    bookmarks: {
        data: BookmarkItem[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function BookmarksIndex({ bookmarks }: Props) {
    const handleRemove = (bookmarkId: number) => {
        router.delete(`/dashboard/bookmarks/${bookmarkId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Bookmark removed');
            },
        });
    };

    const bookmarkData = bookmarks?.data ?? [];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Bookmarks', href: '/dashboard/bookmarks' },
            ]}
        >
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Bookmarks</h1>
                        <p className="text-muted-foreground">
                            Your saved posts for later reading
                        </p>
                    </div>
                    {bookmarkData.length > 0 && (
                        <Badge variant="secondary">
                            {bookmarkData.length} items
                        </Badge>
                    )}
                </div>

                {bookmarkData.length > 0 ? (
                    <div className="space-y-3">
                        {bookmarkData.map((bookmark) => (
                            bookmark.post && (
                                <div
                                    key={bookmark.id}
                                    className="flex items-center gap-4 rounded-lg border bg-card p-4"
                                >
                                    {/* Post Image */}
                                    <Link
                                        href={`/post/${bookmark.post.slug}`}
                                        className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                                    >
                                        {bookmark.post.featured_image ? (
                                            <img
                                                src={bookmark.post.featured_image}
                                                alt={bookmark.post.title}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Post Info */}
                                    <div className="flex flex-1 flex-col gap-1">
                                        <Link
                                            href={`/post/${bookmark.post.slug}`}
                                            className="line-clamp-1 font-medium hover:text-primary"
                                        >
                                            {bookmark.post.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span>By {bookmark.post.author.name}</span>
                                            {bookmark.post.categories.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex gap-1">
                                                        {bookmark.post.categories.slice(0, 2).map((cat) => (
                                                            <Badge
                                                                key={cat.id}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {cat.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {bookmark.post.published_at && (
                                            <span className="text-xs text-muted-foreground">
                                                Published {formatDate(bookmark.post.published_at)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            asChild
                                            className="gap-1.5"
                                        >
                                            <Link href={`/post/${bookmark.post.slug}`}>
                                                <ExternalLink className="h-4 w-4" />
                                                Read
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemove(bookmark.id)}
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Bookmark className="mx-auto h-16 w-16 text-muted-foreground/50" />
                        <h2 className="mt-4 text-lg font-semibold">
                            No bookmarks yet
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Save posts you want to read later
                        </p>
                        <Link href="/posts">
                            <Button className="mt-4">Browse Posts</Button>
                        </Link>
                    </div>
                )}

                {bookmarks && bookmarks.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {bookmarks.links.map((link, index) => (
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
        </AppLayout>
    );
}
