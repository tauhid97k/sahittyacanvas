import PublicLayout from '@/components/public/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Bookmark, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    avatar: string | null;
    bio: string | null;
}

interface User {
    id: number;
    name: string;
    avatar: string | null;
}

interface Category {
    id: number;
    name_bn: string;
    slug: string;
}

interface Page {
    id: number;
    title: string | null;
    content: string;
    order: number;
}

interface Comment {
    id: number;
    content: string;
    user: User;
    created_at: string;
    children: Comment[];
}

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string | null;
    author: Author | null;
    user: User;
    categories: Category[];
    pages: Page[];
    comments: Comment[];
    views_count: number;
    likes_count: number;
    bookmarks_count: number;
    comments_count: number;
    published_at: string;
}

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    views_count: number;
}

interface Props {
    post: Post;
    relatedPosts: RelatedPost[];
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
        month: 'long',
        day: 'numeric',
    });
}

export default function PostShow({ post, relatedPosts }: Props) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = post.pages.length + 1;

    const getCurrentContent = () => {
        if (currentPage === 0) {
            return post.content;
        }
        return post.pages[currentPage - 1]?.content || '';
    };

    return (
        <PublicLayout title={post.title} description={post.excerpt}>
            <article className="container py-8">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">হোম</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/posts">লেখা</BreadcrumbLink>
                        </BreadcrumbItem>
                        {post.categories[0] && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={`/category/${post.categories[0].slug}`}
                                    >
                                        {post.categories[0].name_bn}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{post.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <header className="mb-8">
                        {/* Categories */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {post.categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug}`}
                                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
                                >
                                    {cat.name_bn}
                                </Link>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {/* Author/User */}
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={
                                            post.author?.avatar ||
                                            post.user.avatar ||
                                            undefined
                                        }
                                    />
                                    <AvatarFallback>
                                        {(
                                            post.author?.name_bn ||
                                            post.user.name
                                        ).charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    {post.author ? (
                                        <Link
                                            href={`/author/${post.author.slug}`}
                                            className="font-medium text-foreground hover:text-primary"
                                        >
                                            {post.author.name_bn}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-foreground">
                                            {post.user.name}
                                        </span>
                                    )}
                                    <p className="text-xs">
                                        {formatDate(post.published_at)}
                                    </p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-6" />

                            {/* Stats */}
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {formatNumber(post.views_count)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {formatNumber(post.likes_count)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    {formatNumber(post.comments_count)}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="mb-8 overflow-hidden rounded-lg">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: getCurrentContent(),
                        }}
                    />

                    {/* Page Navigation */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            {Array.from({ length: totalPages }).map(
                                (_, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            currentPage === index
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setCurrentPage(index)}
                                    >
                                        {index + 1}
                                    </Button>
                                ),
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button variant="outline" size="lg" className="gap-2">
                            <Heart className="h-5 w-5" />
                            পছন্দ করুন
                        </Button>
                        <Button variant="outline" size="lg" className="gap-2">
                            <Bookmark className="h-5 w-5" />
                            সংরক্ষণ করুন
                        </Button>
                        <Button variant="outline" size="lg" className="gap-2">
                            <Share2 className="h-5 w-5" />
                            শেয়ার করুন
                        </Button>
                    </div>

                    {/* Author Bio */}
                    {post.author && post.author.bio && (
                        <Card className="mt-8">
                            <CardContent className="flex gap-4 p-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={post.author.avatar || undefined}
                                    />
                                    <AvatarFallback>
                                        {post.author.name_bn.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Link
                                        href={`/author/${post.author.slug}`}
                                        className="text-lg font-semibold hover:text-primary"
                                    >
                                        {post.author.name_bn}
                                    </Link>
                                    {post.author.name_en && (
                                        <p className="text-sm text-muted-foreground">
                                            {post.author.name_en}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {post.author.bio}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Separator className="my-8" />

                    {/* Comments Section */}
                    <section>
                        <h2 className="mb-6 text-xl font-bold">
                            মন্তব্য ({post.comments_count})
                        </h2>

                        {/* Comment Form */}
                        {auth?.user ? (
                            <CommentForm postId={post.id} />
                        ) : (
                            <Card className="mb-6">
                                <CardContent className="p-4 text-center">
                                    <p className="text-muted-foreground">
                                        মন্তব্য করতে{' '}
                                        <Link
                                            href="/login"
                                            className="text-primary hover:underline"
                                        >
                                            লগইন
                                        </Link>{' '}
                                        করুন
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            {post.comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-6 text-2xl font-bold">
                            সম্পর্কিত লেখা
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedPosts.map((p) => (
                                <Link key={p.id} href={`/post/${p.slug}`}>
                                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                                        <div className="aspect-[16/10] overflow-hidden bg-muted">
                                            {p.featured_image ? (
                                                <img
                                                    src={p.featured_image}
                                                    alt={p.title}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                                                    📝
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                                                {p.title}
                                            </h3>
                                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                <Eye className="h-3 w-3" />
                                                {formatNumber(p.views_count)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </PublicLayout>
    );
}

function CommentForm({
    postId,
    parentId,
}: {
    postId: number;
    parentId?: number;
}) {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        parent_id: parentId || null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/post/${postId}/comments`, {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <Textarea
                placeholder="আপনার মন্তব্য লিখুন..."
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                rows={3}
            />
            <div className="mt-2 flex justify-end">
                <Button
                    type="submit"
                    disabled={processing || !data.content.trim()}
                >
                    মন্তব্য করুন
                </Button>
            </div>
        </form>
    );
}

function CommentItem({ comment }: { comment: Comment }) {
    const [showReply, setShowReply] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>
                        {comment.user.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="rounded-lg bg-muted p-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">
                                {comment.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                            </span>
                        </div>
                        <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1"
                        onClick={() => setShowReply(!showReply)}
                    >
                        উত্তর দিন
                    </Button>
                </div>
            </div>

            {/* Replies */}
            {comment.children.length > 0 && (
                <div className="ml-12 space-y-4">
                    {comment.children.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={reply.user.avatar || undefined}
                                />
                                <AvatarFallback>
                                    {reply.user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {reply.user.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(reply.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm">
                                        {reply.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
