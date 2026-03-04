import PublicLayout from '@/components/public/layout/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Eye, Package, Search, User } from 'lucide-react';
import { useState } from 'react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    author: string;
    author_avatar: string | null;
    category: { name: string; slug: string } | null;
    views: number;
    published_at: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    price: string;
    discounted_price: string | null;
    discount_percentage: number | null;
    in_stock: boolean;
    category: { name: string; slug: string } | null;
}

interface Author {
    id: number;
    name: string;
    name_bn: string;
    slug: string;
    avatar: string | null;
    posts_count: number;
}

interface SearchProps {
    query: string;
    type: string;
    posts: Post[];
    products: Product[];
    authors: Author[];
}

const tabs = [
    { value: 'all', label: 'All' },
    { value: 'posts', label: 'Posts' },
    { value: 'products', label: 'Products' },
    { value: 'authors', label: 'Authors' },
];

export default function SearchPage({
    query,
    type,
    posts,
    products,
    authors,
}: SearchProps) {
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery, type });
        }
    };

    const handleTabChange = (newType: string) => {
        if (query) {
            router.get('/search', { q: query, type: newType });
        }
    };

    const totalResults = posts.length + products.length + authors.length;

    return (
        <PublicLayout>
            <Head title={query ? `Search: ${query}` : 'Search'} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search posts, products, authors..."
                                className="pl-10 text-lg"
                            />
                        </div>
                        <Button type="submit" size="lg">
                            Search
                        </Button>
                    </div>
                </form>

                {/* Tabs */}
                {query && (
                    <div className="mb-6 flex gap-2">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.value}
                                variant={type === tab.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleTabChange(tab.value)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Results Summary */}
                {query && (
                    <p className="mb-6 text-sm text-muted-foreground">
                        {totalResults === 0
                            ? `No results found for "${query}"`
                            : `Found ${totalResults} results for "${query}"`}
                    </p>
                )}

                {/* Posts Results */}
                {posts.length > 0 && (
                    <section className="mb-8">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <BookOpen className="size-5" />
                            Posts ({posts.length})
                        </h2>
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/post/${post.slug}`}
                                    className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
                                >
                                    {post.featured_image && (
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="size-20 shrink-0 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-medium">
                                            {post.title}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{post.author}</span>
                                            {post.category && (
                                                <Badge variant="outline" className="text-xs">
                                                    {post.category.name}
                                                </Badge>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Eye className="size-3" />
                                                {post.views}
                                            </span>
                                            <span>{post.published_at}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Products Results */}
                {products.length > 0 && (
                    <section className="mb-8">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Package className="size-5" />
                            Products ({products.length})
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.slug}`}
                                    className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
                                >
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="size-20 shrink-0 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-base font-medium">
                                            {product.name}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {product.discounted_price ?? product.price}
                                            </span>
                                            {product.discounted_price && (
                                                <span className="text-xs text-muted-foreground line-through">
                                                    {product.price}
                                                </span>
                                            )}
                                            {product.discount_percentage && product.discount_percentage > 0 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    -{product.discount_percentage}%
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {product.category && (
                                                <Badge variant="outline" className="text-xs">
                                                    {product.category.name}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant={product.in_stock ? 'default' : 'destructive'}
                                                className="text-xs"
                                            >
                                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Authors Results */}
                {authors.length > 0 && (
                    <section className="mb-8">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <User className="size-5" />
                            Authors ({authors.length})
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {authors.map((author) => (
                                <Link
                                    key={author.id}
                                    href={`/author/${author.slug}`}
                                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
                                >
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                                        {author.avatar ? (
                                            <img
                                                src={author.avatar}
                                                alt={author.name}
                                                className="size-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="size-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{author.name_bn}</h3>
                                        {author.name !== author.name_bn && (
                                            <p className="text-sm text-muted-foreground">
                                                {author.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {author.posts_count} posts
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!query && (
                    <div className="py-20 text-center">
                        <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <h2 className="text-lg font-medium">Start searching</h2>
                        <p className="text-sm text-muted-foreground">
                            Search for posts, products, and authors
                        </p>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
