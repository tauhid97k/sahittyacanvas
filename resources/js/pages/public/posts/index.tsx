import PublicLayout from '@/components/public/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Eye, Heart, Search } from 'lucide-react';
import { useState } from 'react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    author: { id: number; name: string; slug: string } | null;
    user: { id: number; name: string; avatar: string | null };
    category: { name: string; slug: string } | null;
    views_count: number;
    likes_count: number;
    comments_count: number;
    published_at: string;
}

interface Category {
    id: number;
    name_bn: string;
    slug: string;
    posts_count: number;
}

interface Props {
    posts: {
        data: Post[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: {
        search: string | null;
        category: string | null;
        sort: string;
    };
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

export default function PostsIndex({ posts, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/posts', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string | null) => {
        router.get(
            '/posts',
            { ...filters, [key]: value },
            { preserveState: true },
        );
    };

    return (
        <PublicLayout
            title="সব লেখা"
            description="সাহিত্য ক্যানভাসে প্রকাশিত সকল লেখা"
        >
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">সব লেখা</h1>
                    <p className="mt-2 text-muted-foreground">
                        সাহিত্য ক্যানভাসে প্রকাশিত সকল কবিতা, গল্প ও সাহিত্যকর্ম
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="খুঁজুন..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            খুঁজুন
                        </Button>
                    </form>

                    <div className="flex gap-2">
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(v) =>
                                handleFilterChange(
                                    'category',
                                    v === 'all' ? null : v,
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="বিভাগ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">সব বিভাগ</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.slug}>
                                        {cat.name_bn} ({cat.posts_count})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort}
                            onValueChange={(v) => handleFilterChange('sort', v)}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="সাজান" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">
                                    সাম্প্রতিক
                                </SelectItem>
                                <SelectItem value="popular">
                                    জনপ্রিয়
                                </SelectItem>
                                <SelectItem value="liked">
                                    সর্বাধিক পছন্দ
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Posts Grid */}
                {posts.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <p className="text-lg text-muted-foreground">
                            কোনো লেখা পাওয়া যায়নি
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {posts.links.map((link, index) => (
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
                        <span>{post.author?.name ?? post.user.name}</span>
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
                    <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(post.published_at)}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
