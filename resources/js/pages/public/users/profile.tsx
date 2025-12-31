import PublicLayout from '@/components/public/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { Eye, Heart, Package, ShoppingBag, Star, Users } from 'lucide-react';

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

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    image: string | null;
    rating: number;
    reviews_count: number;
}

interface Profile {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    is_seller: boolean;
    joined_at: string;
}

interface Stats {
    posts_count: number;
    total_views: number;
    total_likes: number;
    followers_count: number;
    products_count?: number;
    total_sales?: number;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface Props {
    profile: Profile;
    posts: Post[];
    products: Product[];
    stats: Stats;
    breadcrumb: BreadcrumbItemType[];
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function UserProfile({
    profile,
    posts,
    products,
    stats,
    breadcrumb,
}: Props) {
    return (
        <PublicLayout
            title={profile.name}
            description={profile.bio || undefined}
        >
            {/* Hero Section */}
            <div className="relative">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 sm:h-64">
                    {profile.banner && (
                        <img
                            src={profile.banner}
                            alt={profile.name}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                {/* Profile Info */}
                <div className="container">
                    <div className="relative -mt-16 flex flex-col items-center sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
                        <Avatar className="h-32 w-32 border-4 border-background sm:h-40 sm:w-40">
                            <AvatarImage src={profile.avatar || undefined} />
                            <AvatarFallback className="text-4xl">
                                {profile.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="mt-4 flex-1 text-center sm:mb-4 sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h1 className="text-2xl font-bold sm:text-3xl">
                                    {profile.name}
                                </h1>
                                {profile.is_seller && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        <ShoppingBag className="h-3 w-3" />
                                        বিক্রেতা
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                @{profile.username}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                যোগদান: {profile.joined_at}
                            </p>
                        </div>
                        <div className="mt-4 sm:mb-4">
                            <Button variant="outline">অনুসরণ করুন</Button>
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
                {profile.bio && (
                    <Card className="mb-8">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground">
                                {profile.bio}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    <StatCard
                        icon={<Eye className="h-5 w-5" />}
                        label="মোট ভিউ"
                        value={formatNumber(stats.total_views)}
                    />
                    <StatCard
                        icon={<Heart className="h-5 w-5" />}
                        label="মোট পছন্দ"
                        value={formatNumber(stats.total_likes)}
                    />
                    <StatCard
                        icon={<Users className="h-5 w-5" />}
                        label="অনুসারী"
                        value={formatNumber(stats.followers_count)}
                    />
                    <StatCard
                        icon={<Package className="h-5 w-5" />}
                        label="লেখা"
                        value={formatNumber(stats.posts_count)}
                    />
                    {profile.is_seller &&
                        stats.products_count !== undefined && (
                            <>
                                <StatCard
                                    icon={<ShoppingBag className="h-5 w-5" />}
                                    label="পণ্য"
                                    value={formatNumber(stats.products_count)}
                                />
                                <StatCard
                                    icon={<Star className="h-5 w-5" />}
                                    label="বিক্রয়"
                                    value={formatNumber(stats.total_sales || 0)}
                                />
                            </>
                        )}
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="posts">
                    <TabsList className="mb-6">
                        <TabsTrigger value="posts">
                            লেখা ({posts.length})
                        </TabsTrigger>
                        {profile.is_seller && products.length > 0 && (
                            <TabsTrigger value="products">
                                পণ্য ({products.length})
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="posts">
                        {posts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-muted-foreground">
                                    এখনো কোনো লেখা নেই
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {profile.is_seller && (
                        <TabsContent value="products">
                            {products.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <p className="text-muted-foreground">
                                        এখনো কোনো পণ্য নেই
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </PublicLayout>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
                <div className="text-primary">{icon}</div>
                <p className="mt-2 text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
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

function ProductCard({ product }: { product: Product }) {
    const hasDiscount =
        product.discount_price && product.discount_price < product.price;

    return (
        <Link href={`/product/${product.slug}`}>
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-muted">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                            📦
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                        {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                            {formatPrice(
                                hasDiscount
                                    ? product.discount_price!
                                    : product.price,
                            )}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                    {product.reviews_count > 0 && product.rating != null && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{Number(product.rating).toFixed(1)}</span>
                            <span className="text-muted-foreground">
                                ({product.reviews_count})
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
