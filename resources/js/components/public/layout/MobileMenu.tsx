import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronDown, Home, LayoutDashboard, LogIn, Package, ShoppingBag, UserPlus, Users } from 'lucide-react';
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
            <SheetContent side="left" className="flex w-[300px] flex-col p-0 sm:w-[350px]">
                {/* Header with Logo */}
                <SheetHeader className="border-b bg-muted/30 px-4 py-4">
                    <SheetTitle className="flex items-center gap-3">
                        <AppLogo />
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Site navigation menu
                    </SheetDescription>
                </SheetHeader>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {/* Home */}
                        <Link
                            href="/"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                        >
                            <Home className="h-4 w-4 text-muted-foreground" />
                            হোম
                        </Link>

                        {/* Blog Categories */}
                        <Collapsible open={blogOpen} onOpenChange={setBlogOpen}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                                <span className="flex items-center gap-3">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    লেখালেখি
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 text-muted-foreground transition-transform',
                                        blogOpen && 'rotate-180',
                                    )}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1 ml-4 space-y-1 border-l-2 border-primary/20 pl-4">
                                {blogCategories.map((category) => (
                                    <div key={category.id}>
                                        <Link
                                            href={`/category/${category.slug}`}
                                            onClick={onClose}
                                            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                                        >
                                            {category.name_bn}
                                        </Link>
                                        {category.children &&
                                            category.children.length > 0 && (
                                                <div className="ml-3 space-y-0.5 border-l border-border/50 pl-3">
                                                    {category.children.map(
                                                        (child) => (
                                                            <Link
                                                                key={child.id}
                                                                href={`/category/${child.slug}`}
                                                                onClick={onClose}
                                                                className="block rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                                >
                                    সব লেখা দেখুন →
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Famous Writers */}
                        <Link
                            href="/authors"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                        >
                            <Users className="h-4 w-4 text-muted-foreground" />
                            খ্যাতিমান কবি/লেখক
                        </Link>

                        {/* Shop Categories */}
                        <Collapsible open={shopOpen} onOpenChange={setShopOpen}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                                <span className="flex items-center gap-3">
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                    কেনাকাটা করুন
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 text-muted-foreground transition-transform',
                                        shopOpen && 'rotate-180',
                                    )}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1 ml-4 space-y-1 border-l-2 border-primary/20 pl-4">
                                {productCategories.map((category) => (
                                    <div key={category.id}>
                                        <Link
                                            href={`/product-category/${category.slug}`}
                                            onClick={onClose}
                                            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                                        >
                                            {category.name_bn}
                                        </Link>
                                        {category.children &&
                                            category.children.length > 0 && (
                                                <div className="ml-3 space-y-0.5 border-l border-border/50 pl-3">
                                                    {category.children.map(
                                                        (child) => (
                                                            <Link
                                                                key={child.id}
                                                                href={`/product-category/${child.slug}`}
                                                                onClick={onClose}
                                                                className="block rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                                >
                                    সব পণ্য দেখুন →
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* About Us */}
                        <Link
                            href="/about"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                        >
                            <Package className="h-4 w-4 text-muted-foreground" />
                            আমাদের সম্পর্কে
                        </Link>
                    </div>
                </nav>

                {/* Footer with Auth */}
                <div className="border-t bg-muted/30 px-4 py-4">
                    {user ? (
                        <Button asChild variant="outline" className="w-full gap-2">
                            <Link href="/dashboard" onClick={onClose}>
                                <LayoutDashboard className="h-4 w-4" />
                                ড্যাশবোর্ড
                            </Link>
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="outline" className="w-full gap-2">
                                <Link href="/login" onClick={onClose}>
                                    <LogIn className="h-4 w-4" />
                                    লগইন
                                </Link>
                            </Button>
                            <Button asChild className="w-full gap-2">
                                <Link href="/register" onClick={onClose}>
                                    <UserPlus className="h-4 w-4" />
                                    নিবন্ধন
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
