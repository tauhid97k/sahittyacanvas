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
import { Link, router } from '@inertiajs/react';
import { Eye, Heart } from 'lucide-react';

interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    birth_date: string | null;
    death_date: string | null;
    nationality: string | null;
    posts_count: number;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    category: { name: string; slug: string } | null;
    views_count: number;
    likes_count: number;
    published_at: string;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface Props {
    author: Author;
    posts: {
        data: Post[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    breadcrumb: BreadcrumbItemType[];
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

export default function AuthorShow({ author, posts, breadcrumb }: Props) {
    return (
        <PublicLayout
            title={author.name_bn}
            description={author.bio || undefined}
        >
            {/* Hero Section */}
            <div className="relative">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 sm:h-64">
                    {author.banner && (
                        <img
                            src={author.banner}
                            alt={author.name_bn}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                {/* Profile Info */}
                <div className="container">
                    <div className="relative -mt-16 flex flex-col items-center sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
                        <Avatar className="h-32 w-32 border-4 border-background sm:h-40 sm:w-40">
                            <AvatarImage src={author.avatar || undefined} />
                            <AvatarFallback className="text-4xl">
                                {author.name_bn.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="mt-4 text-center sm:mb-4 sm:text-left">
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {author.name_bn}
                            </h1>
                            {author.name_en && (
                                <p className="text-lg text-muted-foreground">
                                    {author.name_en}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                                {(author.birth_date || author.death_date) && (
                                    <span>
                                        {author.birth_date} -{' '}
                                        {author.death_date || 'বর্তমান'}
                                    </span>
                                )}
                                {author.nationality && (
                                    <span>{author.nationality}</span>
                                )}
                                <span className="font-medium text-primary">
                                    {author.posts_count} লেখা
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        {breadcrumb.map((item, index) => (
                            <BreadcrumbItem key={index}>
                                {index === breadcrumb.length - 1 ? (
                                    <BreadcrumbPage>
                                        {item.title}
                                    </BreadcrumbPage>
                                ) : (
                                    <>
                                        <BreadcrumbLink href={item.href}>
                                            {item.title}
                                        </BreadcrumbLink>
                                        <BreadcrumbSeparator />
                                    </>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Bio */}
                {author.bio && (
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                জীবনী
                            </h2>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {author.bio}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Posts */}
                <div>
                    <h2 className="mb-6 text-xl font-bold">
                        {author.name_bn}-এর লেখাসমূহ
                    </h2>

                    {posts.data.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-lg text-muted-foreground">
                                এই লেখকের কোনো লেখা পাওয়া যায়নি
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {posts.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

function PostCard({ post }: { post: Post }) {
    return (
        <Link href={`/post/${post.slug}`}>
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {post.featured_image ? (
                        <img
                            src={post.featured_image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                            📝
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    {post.category && (
                        <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {post.category.name}
                        </span>
                    )}
                    <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                        {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(post.published_at)}</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(post.views_count)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(post.likes_count)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
