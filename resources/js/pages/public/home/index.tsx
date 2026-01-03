import PublicLayout from '@/components/public/layout/PublicLayout';
import PostCard from '@/components/public/PostCard';
import ProductCard from '@/components/public/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Feather,
    Mail,
    PenTool,
    ShoppingBag,
    Star,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';

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
    discount_type?: 'percentage' | 'flat' | null;
    discount_value?: number | null;
    image: string | null;
    categories?: { id: number; name: string; slug: string }[];
    rating: number | null;
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


export default function HomePage({
    recentPosts,
    popularProducts,
    famousAuthors,
    categories,
}: Props) {
    // Split posts for featured layout: 1 big + 4 small
    const featuredPost = recentPosts[0];
    const sidePosts = recentPosts.slice(1, 5);
    const morePosts = recentPosts.slice(5);

    return (
        <PublicLayout
            title="হোম"
            description="সাহিত্য, কবিতা ও আবৃত্তির অনন্য ভুবন"
        >
            {/* Hero Section with Pattern Background */}
            <section className="relative overflow-hidden bg-white py-20 dark:bg-background lg:py-32">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                </div>
                {/* Decorative Blurs */}
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                
                <div className="relative z-10 container">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                            বাংলা সাহিত্যের প্ল্যাটফর্ম
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-foreground sm:text-5xl lg:text-6xl">
                            <span className="block">সাহিত্য, কবিতা ও আবৃত্তির</span>
                            <span className="block text-primary">
                                অনন্য ভুবন
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-muted-foreground sm:text-lg">
                            বাংলার কবি ও পাঠকের জন্য এক অনন্য প্ল্যাটফর্ম। আপনার
                            সৃজনশীলতা প্রকাশ করুন, অন্যদের লেখা পড়ুন এবং
                            সাহিত্যের জগতে ডুব দিন।
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link href="/posts">
                                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                                    <BookOpen className="size-4" />
                                    লেখা পড়ুন
                                </Button>
                            </Link>
                            <Link href="/shop">
                                <Button size="lg" variant="outline" className="gap-2">
                                    <ShoppingBag className="size-4" />
                                    কেনাকাটা করুন
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Browse by Category - Horizontal Scrollable */}
            {categories.length > 0 && (
                <section className="relative border-t border-gray-100 bg-gray-50 py-12 dark:border-border dark:bg-muted/30">
                    <div className="container">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                                বিভাগ অনুযায়ী ব্রাউজ করুন
                            </h2>
                            <p className="mt-2 text-gray-600 dark:text-muted-foreground">
                                আপনার পছন্দের বিভাগে লেখা খুঁজুন
                            </p>
                        </div>
                        {/* Desktop: flex-wrap centered, Tablet/Mobile: horizontal scroll with snap */}
                        <div className="overflow-hidden">
                            <div className="category-scroll flex flex-nowrap gap-6 overflow-x-auto px-2 py-4 snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible md:snap-none">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/category/${category.slug}`}
                                    className="group flex shrink-0 snap-center flex-col items-center gap-3 text-center"
                                >
                                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100 shadow-md ring-2 ring-gray-200 transition-all group-hover:ring-primary group-hover:ring-4 group-hover:shadow-lg dark:bg-muted dark:ring-border sm:h-24 sm:w-24 md:h-28 md:w-28">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name_bn}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                <BookOpen className="size-8 text-primary/60 sm:size-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-primary dark:text-foreground">
                                            {category.name_bn}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-muted-foreground sm:text-sm">
                                            {category.posts_count} লেখা
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Posts Section - 1 Big + 4 Small Layout */}
            {recentPosts.length > 0 && (
                <section className="bg-muted/30 py-16">
                    <div className="container">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    জনপ্রিয় লেখা
                                </h2>
                                <p className="mt-1 text-muted-foreground">
                                    সদ্য প্রকাশিত সাহিত্যকর্মের সংগ্রহ
                                </p>
                            </div>
                            <Link href="/posts">
                                <Button variant="secondary" className="gap-2">
                                    আরও দেখুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* Featured Layout: 1 Big + 4 Small */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Big Featured Post */}
                            {featuredPost && (
                                <PostCard post={featuredPost} variant="featured" />
                            )}

                            {/* 4 Small Posts Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {sidePosts.map((post) => (
                                    <PostCard key={post.id} post={post} variant="small" />
                                ))}
                            </div>
                        </div>

                        {/* More Posts Row */}
                        {morePosts.length > 0 && (
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {morePosts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <section className="bg-white py-16 dark:bg-background">
                    <div className="container">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                                    জনপ্রিয় পণ্য
                                </h2>
                                <p className="mt-1 text-gray-600 dark:text-muted-foreground">
                                    আমাদের সেরা বিক্রিত পণ্যসমূহ
                                </p>
                            </div>
                            <Link href="/shop">
                                <Button variant="secondary" className="gap-2">
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

            {/* Latest Posts / লেখালেখি Section */}
            {recentPosts.length > 0 && (
                <section className="border-t border-gray-100 bg-gray-50 py-16 dark:border-border dark:bg-muted/30">
                    <div className="container">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                                    সাম্প্রতিক লেখালেখি
                                </h2>
                                <p className="mt-1 text-gray-600 dark:text-muted-foreground">
                                    নতুন প্রকাশিত কবিতা, গল্প ও প্রবন্ধ
                                </p>
                            </div>
                            <Link href="/posts">
                                <Button variant="secondary" className="gap-2">
                                    সব লেখা দেখুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {recentPosts.slice(0, 8).map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Famous Authors - Improved Design */}
            {famousAuthors.length > 0 && (
                <section className="bg-white py-16 dark:bg-background">
                    <div className="container">
                        <div className="mb-10 text-center">
                            <Badge
                                variant="secondary"
                                className="mb-4 px-4 py-1"
                            >
                                <Feather className="mr-2 h-4 w-4" />
                                জনপ্রিয় লেখকগণ
                            </Badge>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground">
                                খ্যাতিমান লেখকদের সাথে পরিচিত হন
                            </h2>
                            <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-muted-foreground">
                                বাংলা সাহিত্যের অসামান্য প্রতিভাবান লেখকদের
                                সংগ্রহ। তাদের লেখা পড়ুন এবং অনুপ্রাণিত হন।
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {famousAuthors.map((author) => (
                                <AuthorCard key={author.id} author={author} />
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <Link href="/authors">
                                <Button size="lg" className="gap-2">
                                    সব লেখক দেখুন
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="border-t border-gray-100 bg-gray-50 py-16 dark:border-border dark:bg-muted/30">
                <div className="container">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
                                    <BookOpen className="size-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-foreground">১০০০+</p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">প্রকাশিত লেখা</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
                                    <Users className="size-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-foreground">৫০০+</p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">নিবন্ধিত লেখক</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
                                    <ShoppingBag className="size-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-foreground">২০০+</p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">বই ও পণ্য</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-gradient-to-br from-primary/10 to-primary/5">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
                                    <TrendingUp className="size-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-foreground">৫০K+</p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">মাসিক পাঠক</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-white py-16 dark:bg-background">
                <div className="container">
                    <div className="mb-10 text-center">
                        <Badge variant="secondary" className="mb-4 px-4 py-1">
                            <Star className="mr-2 size-4" />
                            কেন সাহিত্য ক্যানভাস?
                        </Badge>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground">
                            আমাদের বিশেষত্ব
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-muted-foreground">
                            বাংলা সাহিত্যের জন্য একটি সম্পূর্ণ প্ল্যাটফর্ম
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-white text-center dark:bg-card">
                            <CardContent className="p-6">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <PenTool className="size-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">লেখা প্রকাশ করুন</h3>
                                <p className="mt-2 text-gray-600 dark:text-muted-foreground">
                                    আপনার কবিতা, গল্প, প্রবন্ধ সহজেই প্রকাশ করুন এবং পাঠকদের কাছে পৌঁছে দিন।
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white text-center dark:bg-card">
                            <CardContent className="p-6">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <ShoppingBag className="size-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">বই কিনুন ও বিক্রি করুন</h3>
                                <p className="mt-2 text-gray-600 dark:text-muted-foreground">
                                    বাংলা বই কিনুন অথবা আপনার নিজের বই বিক্রি করুন আমাদের মার্কেটপ্লেসে।
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white text-center dark:bg-card">
                            <CardContent className="p-6">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="size-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">সম্প্রদায়ে যোগ দিন</h3>
                                <p className="mt-2 text-gray-600 dark:text-muted-foreground">
                                    লেখক ও পাঠকদের একটি সক্রিয় সম্প্রদায়ের অংশ হন।
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="border-t border-gray-100 bg-gray-50 py-16 dark:border-border dark:bg-muted/30">
                <div className="container">
                    <Card className="overflow-hidden border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-white dark:border-border dark:to-background">
                        <CardContent className="flex flex-col items-center gap-6 p-8 text-center lg:p-12">
                            <div className="flex size-16 items-center justify-center rounded-full bg-primary/20">
                                <Mail className="size-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground lg:text-3xl">
                                    নিউজলেটারে সাবস্ক্রাইব করুন
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-muted-foreground">
                                    নতুন লেখা, বই এবং বিশেষ অফার সম্পর্কে সবার আগে জানতে আমাদের নিউজলেটারে যোগ দিন।
                                </p>
                            </div>
                            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch">
                                <input
                                    type="email"
                                    placeholder="আপনার ইমেইল লিখুন"
                                    className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none dark:border-border dark:bg-background"
                                />
                                <Button className="h-10 gap-2">
                                    সাবস্ক্রাইব করুন
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </PublicLayout>
    );
}




// Author card with improved design
function AuthorCard({ author }: { author: Author }) {
    return (
        <Link href={`/author/${author.slug}`}>
            <Card className="group overflow-hidden bg-white transition-all hover:shadow-lg dark:bg-card">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200 transition-all group-hover:ring-primary dark:bg-muted dark:ring-border">
                        {author.avatar ? (
                            <img
                                src={author.avatar}
                                alt={author.name_bn}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <User className="h-8 w-8 text-primary/60" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900 transition-colors group-hover:text-primary dark:text-foreground">
                            {author.name_bn}
                        </h3>
                        {author.name_en && (
                            <p className="truncate text-sm text-gray-500 dark:text-muted-foreground">
                                {author.name_en}
                            </p>
                        )}
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-muted-foreground">
                            <BookOpen className="size-4" />
                            <span>{author.posts_count} লেখা</span>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary dark:text-muted-foreground" />
                </CardContent>
            </Card>
        </Link>
    );
}
