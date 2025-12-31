import PublicLayout from '@/components/public/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, Eye, Heart, Star } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    author: {
        id: number;
        name: string;
        avatar: string | null;
    };
    category: {
        name: string;
        slug: string;
    } | null;
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
    seller: {
        id: number;
        name: string;
    };
    rating: number;
    reviews_count: number;
}

interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    avatar: string | null;
    posts_count: number;
}

interface Category {
    id: number;
    name_bn: string;
    slug: string;
    image: string | null;
    posts_count: number;
}

interface Props {
    recentPosts: Post[];
    popularProducts: Product[];
    famousAuthors: Author[];
    categories: Category[];
}

function formatPrice(paisa: number): string {
    return `৳${(paisa / 100).toLocaleString('bn-BD')}`;
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

export default function HomePage({
    recentPosts,
    popularProducts,
    famousAuthors,
    categories,
}: Props) {
    return (
        <PublicLayout
            title="হোম"
            description="সাহিত্য, কবিতা ও আবৃত্তির অনন্য ভুবন"
        >
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
                <div className="relative z-10 container">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            সাহিত্য, কবিতা ও আবৃত্তির{' '}
                            <span className="text-primary">অনন্য ভুবন</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                            বাংলার কবি ও পাঠকের জন্য এক অনন্য প্ল্যাটফর্ম। আপনার
                            সৃজনশীলতা প্রকাশ করুন, অন্যদের লেখা পড়ুন এবং
                            সাহিত্যের জগতে ডুব দিন।
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link href="/posts">
                                <Button size="lg" className="gap-2">
                                    লেখা পড়ুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/shop">
                                <Button size="lg" variant="outline">
                                    কেনাকাটা করুন
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            </section>

            {/* Recent Posts */}
            <section className="py-16">
                <div className="container">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">
                                সাম্প্রতিক লেখা
                            </h2>
                            <p className="mt-1 text-muted-foreground">
                                সদ্য প্রকাশিত সাহিত্যকর্মের সংগ্রহ
                            </p>
                        </div>
                        <Link href="/posts">
                            <Button variant="ghost" className="gap-2">
                                আরও দেখুন
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {recentPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <section className="bg-muted/50 py-16">
                    <div className="container">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    জনপ্রিয় পণ্য 🛍️
                                </h2>
                                <p className="mt-1 text-muted-foreground">
                                    আমাদের সেরা বিক্রিত পণ্যসমূহ
                                </p>
                            </div>
                            <Link href="/shop">
                                <Button variant="ghost" className="gap-2">
                                    সব পণ্য দেখুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {popularProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Famous Authors */}
            {famousAuthors.length > 0 && (
                <section className="py-16">
                    <div className="container">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold">
                                খ্যাতিমান লেখক
                            </h2>
                            <p className="mt-1 text-muted-foreground">
                                আমাদের সৃজনশীল লেখকদের সাথে পরিচিত হন
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            {famousAuthors.map((author) => (
                                <AuthorAvatar key={author.id} author={author} />
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Link href="/authors">
                                <Button variant="outline" className="gap-2">
                                    সব লেখক দেখুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
                <section className="bg-muted/50 py-16">
                    <div className="container">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold">
                                বিভাগ অনুযায়ী
                            </h2>
                            <p className="mt-1 text-muted-foreground">
                                আপনার পছন্দের বিভাগে লেখা খুঁজুন
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
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
                        <span>{post.author.name}</span>
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

function AuthorAvatar({ author }: { author: Author }) {
    return (
        <Link
            href={`/author/${author.slug}`}
            className="group flex flex-col items-center gap-2 text-center"
        >
            <div className="h-20 w-20 overflow-hidden rounded-full bg-muted ring-2 ring-transparent transition-all group-hover:ring-primary">
                {author.avatar ? (
                    <img
                        src={author.avatar}
                        alt={author.name_bn}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                        ✍️
                    </div>
                )}
            </div>
            <div>
                <p className="font-medium group-hover:text-primary">
                    {author.name_bn}
                </p>
                <p className="text-xs text-muted-foreground">
                    {author.posts_count} লেখা
                </p>
            </div>
        </Link>
    );
}

function CategoryCard({ category }: { category: Category }) {
    return (
        <Link href={`/category/${category.slug}`}>
            <Card className="group relative h-32 overflow-hidden transition-shadow hover:shadow-lg">
                {category.image && (
                    <img
                        src={category.image}
                        alt={category.name_bn}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                <div className="relative flex h-full flex-col items-center justify-center text-white">
                    <h3 className="text-xl font-bold">{category.name_bn}</h3>
                    <p className="mt-1 text-sm opacity-80">
                        {category.posts_count} লেখা
                    </p>
                </div>
            </Card>
        </Link>
    );
}
