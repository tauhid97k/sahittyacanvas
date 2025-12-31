import PublicLayout from '@/components/public/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    avatar: string | null;
    posts_count: number;
    birth_date: string | null;
    death_date: string | null;
}

interface Props {
    authors: {
        data: Author[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string | null;
    };
}

export default function AuthorsIndex({ authors, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/authors', { search }, { preserveState: true });
    };

    return (
        <PublicLayout
            title="খ্যাতিমান কবি ও লেখক"
            description="বাংলা সাহিত্যের খ্যাতিমান কবি ও লেখকদের সংগ্রহ"
        >
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">খ্যাতিমান কবি ও লেখক</h1>
                    <p className="mt-2 text-muted-foreground">
                        বাংলা সাহিত্যের অমর সৃষ্টিকর্তাদের সাথে পরিচিত হন
                    </p>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="mx-auto mb-8 flex max-w-md gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="লেখক খুঁজুন..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit">খুঁজুন</Button>
                </form>

                {/* Authors Grid */}
                {authors.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {authors.data.map((author) => (
                            <AuthorCard key={author.id} author={author} />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <p className="text-lg text-muted-foreground">
                            কোনো লেখক পাওয়া যায়নি
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {authors.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {authors.links.map((link, index) => (
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

function AuthorCard({ author }: { author: Author }) {
    const lifespan =
        author.birth_date || author.death_date
            ? `${author.birth_date || '?'} - ${author.death_date || ''}`
            : null;

    return (
        <Link href={`/author/${author.slug}`}>
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                    <Avatar className="h-24 w-24 ring-2 ring-transparent transition-all group-hover:ring-primary">
                        <AvatarImage src={author.avatar || undefined} />
                        <AvatarFallback className="text-2xl">
                            {author.name_bn.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 font-semibold group-hover:text-primary">
                        {author.name_bn}
                    </h3>
                    {author.name_en && (
                        <p className="text-sm text-muted-foreground">
                            {author.name_en}
                        </p>
                    )}
                    {lifespan && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {lifespan}
                        </p>
                    )}
                    <p className="mt-2 text-sm text-primary">
                        {author.posts_count} লেখা
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
