import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Post, PostPage } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Bookmark,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Heart,
    Pencil,
    User,
} from 'lucide-react';

interface Props {
    post: Post;
    currentPage: number;
    currentPageData: PostPage | null;
    pageOrders: number[];
}

const statusColors: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    draft: 'secondary',
    pending: 'outline',
    published: 'default',
    archived: 'destructive',
};

export default function ShowPost({
    post,
    currentPage,
    currentPageData,
    pageOrders,
}: Props) {
    // Truncate title for breadcrumb
    const truncateTitle = (title: string, maxLength: number = 30) => {
        return title.length > maxLength
            ? title.slice(0, maxLength) + '...'
            : title;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/dashboard/posts' },
        {
            title: truncateTitle(post.title_en || post.title_bn),
            href: `/dashboard/posts/${post.slug}`,
        },
    ];

    // Get content based on current page
    const content =
        currentPage === 1 ? post.content : currentPageData?.content || '';

    // Pagination helpers
    const totalPages = pageOrders.length;
    const currentIndex = pageOrders.indexOf(currentPage);
    const hasPrevPage = currentIndex > 0;
    const hasNextPage = currentIndex < totalPages - 1;
    const prevPage = hasPrevPage ? pageOrders[currentIndex - 1] : null;
    const nextPage = hasNextPage ? pageOrders[currentIndex + 1] : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={post.title_bn || post.title_en} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/posts">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">View Post</h1>
                        <p className="text-sm text-muted-foreground">
                            Preview post content
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`/dashboard/posts/${post.slug}/edit`}>
                            <Pencil />
                            Edit Post
                        </Link>
                    </Button>
                </div>

                {/* Post Content */}
                <Card>
                    <CardContent className="p-0">
                        {/* Featured Image */}
                        {post.featured_image_url && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                                <img
                                    src={post.featured_image_url}
                                    alt={post.title_bn || post.title_en}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            {/* Meta Info */}
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                <Badge variant={statusColors[post.status]}>
                                    {post.status.charAt(0).toUpperCase() +
                                        post.status.slice(1)}
                                </Badge>
                                {post.categories &&
                                    post.categories.length > 0 && (
                                        <>
                                            <span className="text-muted-foreground">
                                                |
                                            </span>
                                            {post.categories.map((category) => (
                                                <Badge
                                                    key={category.id}
                                                    variant="secondary"
                                                >
                                                    {category.name_bn}
                                                </Badge>
                                            ))}
                                        </>
                                    )}
                            </div>

                            {/* Title */}
                            <h1 className="mb-2 text-3xl leading-tight font-bold md:text-4xl">
                                {post.title_bn}
                            </h1>
                            {post.title_en && (
                                <h2 className="mb-6 text-xl text-muted-foreground">
                                    {post.title_en}
                                </h2>
                            )}

                            {/* Author & Date */}
                            <div className="mb-8 flex flex-wrap items-center gap-6 border-b pb-6">
                                {post.author ? (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {post.author.avatar_url ? (
                                                <AvatarImage
                                                    src={post.author.avatar_url}
                                                    alt={post.author.name_bn}
                                                />
                                            ) : null}
                                            <AvatarFallback>
                                                {post.author.name_bn.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {post.author.name_bn}
                                            </p>
                                            {post.author.name_en && (
                                                <p className="text-sm text-muted-foreground">
                                                    {post.author.name_en}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : post.user ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="size-5" />
                                        <span>{post.user.name}</span>
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="size-5" />
                                    <span>
                                        {post.published_at
                                            ? format(
                                                  new Date(post.published_at),
                                                  'MMM d, yyyy',
                                              )
                                            : format(
                                                  new Date(post.created_at),
                                                  'MMM d, yyyy',
                                              )}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Eye className="size-5" />
                                        {post.visit_count_total ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="size-5" />
                                        {post.likes_count ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bookmark className="size-5" />
                                        {post.bookmarks_count ?? 0}
                                    </span>
                                </div>
                            </div>

                            {/* Excerpt */}
                            {currentPage === 1 && post.excerpt && (
                                <p className="mb-8 text-lg text-muted-foreground italic">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Content */}
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />

                            {/* Page Navigation */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t pt-6">
                                    <div>
                                        {hasPrevPage ? (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                asChild
                                            >
                                                <Link
                                                    href={`/dashboard/posts/${post.slug}?page=${prevPage}`}
                                                >
                                                    <ChevronLeft />
                                                    Previous Page
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {pageOrders.map((pageNum) => (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    pageNum === currentPage
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="lg"
                                                className="min-w-10"
                                                asChild
                                            >
                                                <Link
                                                    href={`/dashboard/posts/${post.slug}?page=${pageNum}`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>

                                    <div>
                                        {hasNextPage ? (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                asChild
                                            >
                                                <Link
                                                    href={`/dashboard/posts/${post.slug}?page=${nextPage}`}
                                                >
                                                    Next Page
                                                    <ChevronRight />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
