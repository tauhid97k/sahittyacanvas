import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedData } from '@/types/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Package,
    UserCheck,
    Users,
} from 'lucide-react';

interface UserRole {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    username: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
    is_verified: boolean;
    banned_at: string | null;
    created_at: string;
    roles: UserRole[];
    posts_count: number;
    followers_count: number;
    following_count: number;
}

interface Post {
    id: number;
    title_bn: string;
    title_en: string | null;
    slug: string;
    excerpt: string | null;
    status: string;
    featured_image_url: string | null;
    created_at: string;
    categories?: { id: number; name_bn: string; name_en: string | null }[];
    author?: { id: number; name_bn: string; name_en: string | null } | null;
}

interface Product {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    status: string;
    featured_image_url: string | null;
    formatted_price: string;
    formatted_discounted_price: string;
    discount_percentage: number | null;
    stock_count: number;
    created_at: string;
    categories?: { id: number; name_bn: string }[];
}

interface Follower {
    id: number;
    follower: {
        id: number;
        name: string;
        email: string;
        username: string | null;
        avatar: string | null;
    };
    created_at: string;
}

interface Props {
    user: User;
    tabData: PaginatedData<Post | Product | Follower> | null;
    activeTab: string;
}

export default function UserShow({ user, tabData, activeTab }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/dashboard/users' },
        { title: user.name, href: `/dashboard/users/${user.id}` },
    ];

    const handleTabChange = (tab: string) => {
        router.get(
            `/dashboard/users/${user.id}`,
            { tab },
            { preserveScroll: true },
        );
    };

    const posts = activeTab === 'posts' ? (tabData?.data as Post[]) : [];
    const products = activeTab === 'products' ? (tabData?.data as Product[]) : [];
    const followers =
        activeTab === 'followers' ? (tabData?.data as Follower[]) : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/users">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">User Profile</h1>
                        <p className="text-sm text-muted-foreground">
                            View user details and activity
                        </p>
                    </div>
                </div>

                {/* Profile Card with Banner */}
                <Card className="overflow-hidden">
                    {/* Banner */}
                    <div className="relative h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5">
                        {user.banner && (
                            <img
                                src={user.banner}
                                alt="Banner"
                                className="h-full w-full object-cover"
                            />
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>

                    {/* Profile Info */}
                    <div className="relative px-6 pb-6">
                        {/* Avatar - positioned to overlap banner */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                            <Avatar className="size-32 border-4 border-background shadow-lg">
                                <AvatarImage
                                    src={user.avatar || undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className="text-3xl font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* User Details */}
                        <div className="pt-20 text-center">
                            {/* Name and Verification */}
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-bold">
                                    {user.name}
                                </h2>
                                {user.is_verified && (
                                    <UserCheck className="size-5 text-primary" />
                                )}
                            </div>

                            {/* Username and Email */}
                            {user.username && (
                                <p className="text-muted-foreground">
                                    @{user.username}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>

                            {/* Roles */}
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {user.roles.map((role) => (
                                    <Badge key={role.id} variant="secondary">
                                        {role.name}
                                    </Badge>
                                ))}
                                {user.banned_at && (
                                    <Badge variant="destructive">Banned</Badge>
                                )}
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                                    {user.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="mt-6 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 md:gap-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <FileText className="size-4 text-muted-foreground" />
                                        <span className="text-xl font-bold sm:text-2xl">
                                            {user.posts_count}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Posts
                                    </p>
                                </div>
                                <div className="hidden h-8 w-px bg-border sm:block" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Users className="size-4 text-muted-foreground" />
                                        <span className="text-xl font-bold sm:text-2xl">
                                            {user.followers_count}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Followers
                                    </p>
                                </div>
                                <div className="hidden h-8 w-px bg-border sm:block" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Users className="size-4 text-muted-foreground" />
                                        <span className="text-xl font-bold sm:text-2xl">
                                            {user.following_count}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Following
                                    </p>
                                </div>
                                <div className="hidden h-8 w-px bg-border sm:block" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span className="text-xs font-medium sm:text-sm">
                                            {format(
                                                new Date(user.created_at),
                                                'MMM d, yyyy',
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground sm:text-sm">
                                        Joined
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tabs Section */}
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="posts"
                            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <FileText className="size-4 shrink-0" />
                            <span className="truncate">Posts</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="products"
                            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <Package className="size-4 shrink-0" />
                            <span className="truncate">Products</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="followers"
                            className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <Users className="size-4 shrink-0" />
                            <span className="truncate">Followers</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Posts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {posts && posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="flex gap-4 rounded-lg border p-4"
                                            >
                                                {post.featured_image_url && (
                                                    <img
                                                        src={
                                                            post.featured_image_url
                                                        }
                                                        alt={post.title_bn}
                                                        className="h-20 w-32 shrink-0 rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-medium">
                                                        {post.title_bn}
                                                    </h4>
                                                    {post.excerpt && (
                                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                                            {post.excerpt}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge
                                                            variant={
                                                                post.status ===
                                                                'published'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {post.status}
                                                        </Badge>
                                                        <span>
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    post.created_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {tabData && tabData.total > 0 && (
                                            <Pagination
                                                links={tabData.links}
                                                from={tabData.from}
                                                to={tabData.to}
                                                total={tabData.total}
                                                perPage={tabData.per_page}
                                                currentPath={`/dashboard/users/${user.id}?tab=posts`}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                                        <p>No posts to display yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {products && products.length > 0 ? (
                                    <div className="space-y-4">
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex gap-4 rounded-lg border p-4"
                                            >
                                                {product.featured_image_url && (
                                                    <img
                                                        src={
                                                            product.featured_image_url
                                                        }
                                                        alt={product.name_bn}
                                                        className="h-20 w-20 shrink-0 rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-medium">
                                                        {product.name_bn}
                                                    </h4>
                                                    {product.name_en && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {product.name_en}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {product.discount_percentage ? (
                                                            <>
                                                                <span className="font-semibold text-primary">
                                                                    {product.formatted_discounted_price}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground line-through">
                                                                    {product.formatted_price}
                                                                </span>
                                                                <Badge variant="destructive" className="text-xs">
                                                                    -{product.discount_percentage}%
                                                                </Badge>
                                                            </>
                                                        ) : (
                                                            <span className="font-semibold">
                                                                {product.formatted_price}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge
                                                            variant={
                                                                product.status ===
                                                                'published'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {product.status}
                                                        </Badge>
                                                        <span>Stock: {product.stock_count}</span>
                                                        <span>
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    product.created_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/products/${product.slug}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                        {tabData && tabData.total > 0 && (
                                            <Pagination
                                                links={tabData.links}
                                                from={tabData.from}
                                                to={tabData.to}
                                                total={tabData.total}
                                                perPage={tabData.per_page}
                                                currentPath={`/dashboard/users/${user.id}?tab=products`}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                                        <p>No products to display yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="followers" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Followers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {followers && followers.length > 0 ? (
                                    <div className="space-y-3">
                                        {followers.map((follow) => (
                                            <div
                                                key={follow.id}
                                                className="flex items-center gap-3 rounded-lg border p-3"
                                            >
                                                <Avatar className="size-10">
                                                    <AvatarImage
                                                        src={
                                                            follow.follower
                                                                .avatar ||
                                                            undefined
                                                        }
                                                        alt={
                                                            follow.follower.name
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {follow.follower.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {follow.follower.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {follow.follower
                                                            .username
                                                            ? `@${follow.follower.username}`
                                                            : follow.follower
                                                                  .email}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            follow.created_at,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                        {tabData && tabData.total > 0 && (
                                            <Pagination
                                                links={tabData.links}
                                                from={tabData.from}
                                                to={tabData.to}
                                                total={tabData.total}
                                                perPage={tabData.per_page}
                                                currentPath={`/dashboard/users/${user.id}?tab=followers`}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                                        <p>No followers to display yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
