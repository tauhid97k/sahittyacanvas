import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link, usePage } from '@inertiajs/react';
import { Heart, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import MobileMenu from './MobileMenu';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total: number;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
        stock: number;
        seller: { id: number; name: string; username: string } | null;
    } | null;
}

interface GroupedCart {
    seller: { id: number; name: string; username: string } | null;
    items: CartItem[];
    subtotal: number;
}

interface CartItems {
    items: CartItem[];
    grouped: GroupedCart[];
    subtotal: number;
    formatted_subtotal: string;
}

interface Category {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    children?: Category[];
}

export default function PublicHeader() {
    const {
        auth,
        blogCategories = [],
        productCategories = [],
        cartCount = 0,
        cartItems = {
            items: [],
            grouped: [],
            subtotal: 0,
            formatted_subtotal: '৳0.00',
        },
    } = usePage<{
        auth: { user: { id: number; name: string } | null };
        blogCategories: Category[];
        productCategories: Category[];
        cartCount: number;
        cartItems: CartItems;
    }>().props;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const user = auth?.user;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex items-center justify-between py-2">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center">
                    <AppLogo />
                </Link>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden lg:flex">
                    <NavigationMenuList>
                        {/* Home */}
                        <NavigationMenuItem>
                            <Link
                                href="/"
                                className={navigationMenuTriggerStyle()}
                            >
                                হোম
                            </Link>
                        </NavigationMenuItem>

                        {/* Famous Writers */}
                        <NavigationMenuItem>
                            <Link
                                href="/authors"
                                className={navigationMenuTriggerStyle()}
                            >
                                খ্যাতিমান কবি/লেখক
                            </Link>
                        </NavigationMenuItem>

                        {/* Blog Categories - লেখালেখি */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                লেখালেখি
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {blogCategories.map((category) => (
                                        <li key={category.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    className="block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="text-sm leading-none font-medium">
                                                        {category.name_bn}
                                                    </div>
                                                    {category.children &&
                                                        category.children
                                                            .length > 0 && (
                                                            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                                {category.children
                                                                    .map(
                                                                        (c) =>
                                                                            c.name_bn,
                                                                    )
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                    <li className="col-span-full border-t pt-2">
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/posts"
                                                className="block rounded-md p-3 text-center text-sm font-medium text-primary select-none hover:bg-accent"
                                            >
                                                সব লেখা দেখুন →
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Shop - কেনাকাটা করুন */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                কেনাকাটা করুন
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-1 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {productCategories.map((category) => (
                                        <li key={category.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/product-category/${category.slug}`}
                                                    className="block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="text-sm leading-none font-medium">
                                                        {category.name_bn}
                                                    </div>
                                                    {category.children &&
                                                        category.children
                                                            .length > 0 && (
                                                            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                                {category.children
                                                                    .map(
                                                                        (c) =>
                                                                            c.name_bn,
                                                                    )
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                    <li className="col-span-full border-t pt-2">
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href="/shop"
                                                className="block rounded-md p-3 text-center text-sm font-medium text-primary select-none hover:bg-accent"
                                            >
                                                সব পণ্য দেখুন →
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* About Us */}
                        <NavigationMenuItem>
                            <Link
                                href="/about"
                                className={navigationMenuTriggerStyle()}
                            >
                                আমাদের সম্পর্কে
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setSearchOpen(!searchOpen)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>

                    {/* Wishlist */}
                    <Link href="/wishlist">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9"
                        >
                            <Heart className="h-5 w-5" />
                            <span className="sr-only">Wishlist</span>
                        </Button>
                    </Link>

                    {/* Cart */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9"
                        onClick={() => setCartOpen(true)}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                        <span className="sr-only">Cart</span>
                    </Button>

                    {/* Theme Toggle */}
                    <AppearanceToggleDropdown />

                    {/* Auth Buttons */}
                    {user ? (
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                ড্যাশবোর্ড
                            </Button>
                        </Link>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    লগইন
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">নিবন্ধন</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 lg:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Menu</span>
                    </Button>
                </div>
            </div>

            {/* Search Bar (Expandable) */}
            {searchOpen && (
                <div className="border-t bg-background p-4">
                    <div className="container">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="খুঁজুন কবিতা, গল্প, লেখক..."
                                className="w-full rounded-md border bg-background py-2 pr-10 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                autoFocus
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                onClick={() => setSearchOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            <MobileMenu
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                blogCategories={blogCategories}
                productCategories={productCategories}
                user={user}
            />

            {/* Cart Drawer */}
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cartItems={cartItems}
            />
        </header>
    );
}
