import LoginModal from '@/components/public/LoginModal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router, usePage } from '@inertiajs/react';
import { Bookmark, BookOpen, Eye, Heart, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image: string | null;
    author: {
        id: number;
        name: string;
        avatar: string | null;
    };
    category?: {
        name: string;
        slug: string;
    } | null;
    views_count: number;
    likes_count: number;
    published_at?: string;
}

interface SharedProps {
    auth: { user: { id: number; name: string } | null };
    bookmarkedPostIds?: number[];
    [key: string]: unknown;
}

interface PostCardProps {
    post: Post;
    variant?: 'default' | 'featured' | 'small' | 'horizontal';
    showExcerpt?: boolean;
    className?: string;
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function PostCard({
    post,
    variant = 'default',
    showExcerpt = true,
    className = '',
}: PostCardProps) {
    const { auth, bookmarkedPostIds = [] } = usePage<SharedProps>().props;
    const isBookmarked = bookmarkedPostIds.includes(post.id);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);

    const handleBookmarkToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth?.user) {
            setShowLoginModal(true);
            return;
        }
        // Optimistic update
        const newState = !localIsBookmarked;
        setLocalIsBookmarked(newState);
        router.post(
            `/post/${post.id}/bookmark`,
            {},
            { 
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(newState ? 'Added to bookmarks' : 'Removed from bookmarks');
                },
            }
        );
    };

    if (variant === 'featured') {
        return (
            <>
                <Link href={`/post/${post.slug}`} className={`block h-full ${className}`}>
                    <Card className="group h-full overflow-hidden bg-white transition-all hover:shadow-xl dark:bg-card">
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-muted">
                            {post.featured_image ? (
                                <img
                                    src={post.featured_image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-gray-100 dark:to-muted">
                                    <BookOpen className="size-16 text-gray-400 dark:text-muted-foreground/30" />
                                </div>
                            )}
                            {post.category && (
                                <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary">
                                    {post.category.name}
                                </Badge>
                            )}
                            <button
                                className={`absolute top-3 right-3 flex size-9 items-center justify-center rounded-full shadow-md transition-all ${
                                    localIsBookmarked
                                        ? 'bg-primary text-white hover:bg-primary/90'
                                        : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                                onClick={handleBookmarkToggle}
                            >
                                <Bookmark className={`size-4 ${localIsBookmarked ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        <CardContent className="p-5">
                            <h3 className="line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-primary dark:text-foreground lg:text-2xl">
                                {post.title}
                            </h3>
                            {showExcerpt && post.excerpt && (
                                <p className="mt-3 line-clamp-2 text-gray-600 dark:text-muted-foreground">
                                    {post.excerpt}
                                </p>
                            )}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    {post.author.avatar ? (
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="size-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-border"
                                        />
                                    ) : (
                                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-muted">
                                            <User className="size-4 text-gray-500 dark:text-muted-foreground" />
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-700 dark:text-foreground">{post.author.name}</span>
                                </div>
                                <span className="pointer-events-none flex items-center gap-1.5">
                                    <Eye className="size-4" />
                                    <span>{formatNumber(post.views_count)}</span>
                                </span>
                                <span className="pointer-events-none flex items-center gap-1.5">
                                    <Heart className="size-4" />
                                    <span>{formatNumber(post.likes_count)}</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
            </>
        );
    }

    if (variant === 'small') {
        return (
            <>
                <Link href={`/post/${post.slug}`} className={className}>
                    <Card className="group h-full overflow-hidden bg-white transition-all hover:shadow-lg dark:bg-card">
                        <div className="flex h-full flex-col">
                            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-muted">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-gray-100 dark:to-muted">
                                        <BookOpen className="size-10 text-gray-400 dark:text-muted-foreground/40" />
                                    </div>
                                )}
                                {post.category && (
                                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700 hover:bg-white dark:bg-background/90 dark:text-foreground">
                                        {post.category.name}
                                    </Badge>
                                )}
                                <button
                                    className={`absolute top-2 right-2 flex size-8 items-center justify-center rounded-full shadow-md transition-all ${
                                        localIsBookmarked
                                            ? 'bg-primary text-white hover:bg-primary/90'
                                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={handleBookmarkToggle}
                                >
                                    <Bookmark className={`size-4 ${localIsBookmarked ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                            <CardContent className="flex flex-1 flex-col p-3">
                                <h3 className="line-clamp-2 flex-1 font-medium leading-snug text-gray-900 group-hover:text-primary dark:text-foreground">
                                    {post.title}
                                </h3>
                                <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        {post.author.avatar ? (
                                            <img
                                                src={post.author.avatar}
                                                alt={post.author.name}
                                                className="size-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-muted">
                                                <User className="size-3" />
                                            </div>
                                        )}
                                        <span className="truncate text-gray-700 dark:text-foreground">{post.author.name}</span>
                                    </div>
                                    <div className="pointer-events-none flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Eye className="size-4" />
                                            {formatNumber(post.views_count)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="size-4" />
                                            {formatNumber(post.likes_count)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </Link>
                <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
            </>
        );
    }

    // Default variant
    return (
        <>
            <Link href={`/post/${post.slug}`} className={className}>
                <Card className="group h-full overflow-hidden bg-white transition-all hover:shadow-lg dark:bg-card">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-muted">
                        {post.featured_image ? (
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-gray-100 dark:to-muted">
                                <BookOpen className="size-12 text-gray-400 dark:text-muted-foreground/40" />
                            </div>
                        )}
                        <button
                            className={`absolute top-2 right-2 flex size-8 items-center justify-center rounded-full shadow-md transition-all ${
                                localIsBookmarked
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                            onClick={handleBookmarkToggle}
                        >
                            <Bookmark className={`size-4 ${localIsBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    <CardContent className="p-4">
                        {post.category && (
                            <Badge variant="secondary" className="mb-2">
                                {post.category.name}
                            </Badge>
                        )}
                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-foreground">
                            {post.title}
                        </h3>
                        {showExcerpt && post.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-muted-foreground">
                                {post.excerpt}
                            </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground">
                            <div className="flex items-center gap-2">
                                {post.author.avatar ? (
                                    <img
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        className="size-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-muted">
                                        <User className="size-3" />
                                    </div>
                                )}
                                <span className="font-medium text-gray-700 dark:text-foreground">{post.author.name}</span>
                            </div>
                            <div className="pointer-events-none flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Eye className="size-4" />
                                    {formatNumber(post.views_count)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="size-4" />
                                    {formatNumber(post.likes_count)}
                                </span>
                            </div>
                        </div>
                        {post.published_at && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-muted-foreground">
                                {formatDate(post.published_at)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </Link>
            <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </>
    );
}
