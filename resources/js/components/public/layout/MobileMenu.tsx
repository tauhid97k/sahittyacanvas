import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    children?: Category[];
}

interface MobileMenuProps {
    open: boolean;
    onClose: () => void;
    blogCategories: Category[];
    productCategories: Category[];
    user: { id: number; name: string } | null;
}

export default function MobileMenu({
    open,
    onClose,
    blogCategories,
    productCategories,
    user,
}: MobileMenuProps) {
    const [blogOpen, setBlogOpen] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                    <SheetTitle className="text-left">মেনু</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                    {/* Home */}
                    <Link
                        href="/"
                        onClick={onClose}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        হোম
                    </Link>

                    {/* Blog Categories */}
                    <Collapsible open={blogOpen} onOpenChange={setBlogOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                            লেখালেখি
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    blogOpen && 'rotate-180',
                                )}
                            />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-3 border-l pl-3">
                            {blogCategories.map((category) => (
                                <div key={category.id}>
                                    <Link
                                        href={`/category/${category.slug}`}
                                        onClick={onClose}
                                        className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                                    >
                                        {category.name_bn}
                                    </Link>
                                    {category.children &&
                                        category.children.length > 0 && (
                                            <div className="ml-3 border-l pl-3">
                                                {category.children.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/category/${child.slug}`}
                                                            onClick={onClose}
                                                            className="block rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        >
                                                            {child.name_bn}
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            ))}
                            <Link
                                href="/posts"
                                onClick={onClose}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                            >
                                সব লেখা দেখুন →
                            </Link>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Famous Writers */}
                    <Link
                        href="/authors"
                        onClick={onClose}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        খ্যাতিমান কবি/লেখক
                    </Link>

                    {/* Shop Categories */}
                    <Collapsible open={shopOpen} onOpenChange={setShopOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                            কেনাকাটা করুন
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    shopOpen && 'rotate-180',
                                )}
                            />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-3 border-l pl-3">
                            {productCategories.map((category) => (
                                <div key={category.id}>
                                    <Link
                                        href={`/product-category/${category.slug}`}
                                        onClick={onClose}
                                        className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                                    >
                                        {category.name_bn}
                                    </Link>
                                    {category.children &&
                                        category.children.length > 0 && (
                                            <div className="ml-3 border-l pl-3">
                                                {category.children.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/product-category/${child.slug}`}
                                                            onClick={onClose}
                                                            className="block rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        >
                                                            {child.name_bn}
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            ))}
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                            >
                                সব পণ্য দেখুন →
                            </Link>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* About Us */}
                    <Link
                        href="/about"
                        onClick={onClose}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        আমাদের সম্পর্কে
                    </Link>

                    {/* Divider */}
                    <div className="my-4 border-t" />

                    {/* Auth */}
                    {user ? (
                        <Link
                            href="/dashboard"
                            onClick={onClose}
                            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                        >
                            ড্যাশবোর্ড
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                            >
                                লগইন
                            </Link>
                            <Link
                                href="/register"
                                onClick={onClose}
                                className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                নিবন্ধন
                            </Link>
                        </>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
