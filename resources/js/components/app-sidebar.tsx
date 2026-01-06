import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNotifications } from '@/hooks/use-notifications';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    Bell,
    Bookmark,
    BookOpen,
    Feather,
    FolderTree,
    Heart,
    LayoutGrid,
    List,
    MessageCircle,
    Package,
    PenBox,
    Settings,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Star,
    User,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Settings',
//         href: '#',
//         icon: Settings,
//     },
// ];

export function AppSidebar() {
    const { unreadCount } = useNotifications();

    const mainNavItems: NavItem[] = useMemo(
        () => [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Users',
                href: '/dashboard/users',
                icon: User,
            },
            {
                title: 'Roles',
                href: '/dashboard/roles',
                icon: Shield,
            },
            {
                title: 'Categories',
                href: '/dashboard/categories',
                icon: List,
            },
            {
                title: 'Famous Writers',
                href: '/dashboard/authors',
                icon: Feather,
            },
            {
                title: 'Posts',
                href: '/dashboard/posts',
                icon: PenBox,
            },
            {
                title: 'Likes',
                href: '/dashboard/likes',
                icon: Heart,
            },
            {
                title: 'Bookmarks',
                href: '/dashboard/bookmarks',
                icon: BookOpen,
            },
            {
                title: 'Wishlist',
                href: '/dashboard/wishlist',
                icon: Bookmark,
            },
            {
                title: 'Comments',
                href: '/dashboard/comments',
                icon: MessageCircle,
            },
            {
                title: 'Moderation',
                href: '/dashboard/moderation',
                icon: ShieldCheck,
            },
            {
                title: 'Activities',
                href: '/dashboard/activities',
                icon: Activity,
            },
            {
                title: 'Notifications',
                href: '/dashboard/notifications',
                icon: Bell,
                badge: unreadCount > 0 ? unreadCount : null,
            },
            // Ecommerce
            {
                title: 'Product Categories',
                href: '/dashboard/product-categories',
                icon: FolderTree,
            },
            {
                title: 'Products',
                href: '/dashboard/products',
                icon: Package,
            },
            {
                title: 'Product Reviews',
                href: '/dashboard/product-reviews',
                icon: Star,
            },
            {
                title: 'Orders',
                href: '/dashboard/orders',
                icon: ShoppingCart,
            },
            {
                title: 'Transactions',
                href: '/dashboard/transactions',
                icon: Banknote,
            },
            // Rules & Settings
            {
                title: 'Rules',
                href: '/dashboard/rules',
                icon: BookOpen,
            },
            {
                title: 'Settings',
                href: '/dashboard/settings',
                icon: Settings,
            },
        ],
        [unreadCount],
    );

    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center">
                        <Link href={dashboard()} prefetch>
                            <AppLogo />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
