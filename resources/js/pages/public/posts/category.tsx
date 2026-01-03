import PublicLayout from '@/components/public/layout/PublicLayout';
import PostCard from '@/components/public/PostCard';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';

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
    category?: {
        name: string;
        slug: string;
    } | null;
    views_count: number;
    likes_count: number;
    published_at: string;
}

interface Category {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    description: string | null;
    image: string | null;
}

interface Subcategory {
    id: number;
    name_bn: string;
    slug: string;
    posts_count: number;
}

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface Props {
    category: Category;
    posts: {
        data: Post[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    subcategories: Subcategory[];
    breadcrumb: BreadcrumbItem[];
}


export default function CategoryPage({
    category,
    posts,
    subcategories,
    breadcrumb,
}: Props) {
    return (
        <PublicLayout
            title={category.name_bn}
            description={
                category.description || `${category.name_bn} বিভাগের সকল লেখা`
            }
        >
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-background py-12">
                {category.image && (
                    <div className="absolute inset-0 opacity-10">
                        <img
                            src={category.image}
                            alt={category.name_bn}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative container">
                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
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

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        {category.name_bn}
                    </h1>
                    {category.name_en && (
                        <p className="mt-1 text-lg text-muted-foreground">
                            {category.name_en}
                        </p>
                    )}
                    {category.description && (
                        <p className="mt-4 max-w-2xl text-muted-foreground">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="container py-8">
                {/* Subcategories */}
                {subcategories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold">
                            উপ-বিভাগসমূহ
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub.id}
                                    href={`/category/${sub.slug}`}
                                    className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                                >
                                    {sub.name_bn} ({sub.posts_count})
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

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
                            এই বিভাগে কোনো লেখা পাওয়া যায়নি
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

