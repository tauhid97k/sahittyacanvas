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
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    Bell,
    Bookmark,
    BookOpen,
    CreditCard,
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
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const mainNavItems: NavItem[] = useMemo(() => {
        // Helper function to check if user has permission
        const can = (permission: string): boolean => {
            if (!user?.permissions) return false;
            return user.permissions.includes(permission);
        };

        // Helper to check if user has any of the given permissions
        const canAny = (...permissions: string[]): boolean => {
            return permissions.some((p) => can(p));
        };

        const items: NavItem[] = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ];

        // ===== ADMIN SECTION =====

        // User Management (ADMIN/SUPER only)
        if (can('LIST_USER')) {
            items.push({
                title: 'Users',
                href: '/dashboard/users',
                icon: User,
            });
        }

        // Role Management (ADMIN/SUPER only)
        if (can('LIST_ROLE')) {
            items.push({
                title: 'Roles',
                href: '/dashboard/roles',
                icon: Shield,
            });
        }

        // ===== CONTENT MANAGEMENT SECTION =====

        if (can('LIST_CATEGORY')) {
            items.push({
                title: 'Categories',
                href: '/dashboard/categories',
                icon: List,
            });
        }

        if (can('LIST_AUTHOR')) {
            items.push({
                title: 'Famous Writers',
                href: '/dashboard/authors',
                icon: Feather,
            });
        }

        if (can('LIST_POST')) {
            items.push({
                title: 'Posts',
                href: '/dashboard/posts',
                icon: PenBox,
            });
        }

        if (can('LIST_COMMENT')) {
            items.push({
                title: 'Comments',
                href: '/dashboard/comments',
                icon: MessageCircle,
            });
        }

        if (can('LIST_MODERATION')) {
            items.push({
                title: 'Moderation',
                href: '/dashboard/moderation',
                icon: ShieldCheck,
            });
        }

        // ===== ECOMMERCE SECTION =====

        if (can('LIST_PRODUCT_CATEGORY')) {
            items.push({
                title: 'Product Categories',
                href: '/dashboard/product-categories',
                icon: FolderTree,
            });
        }

        if (can('LIST_PRODUCT')) {
            items.push({
                title: 'Products',
                href: '/dashboard/products',
                icon: Package,
            });
        }

        if (can('LIST_PRODUCT_REVIEW')) {
            items.push({
                title: 'Product Reviews',
                href: '/dashboard/product-reviews',
                icon: Star,
            });
        }

        // Orders
        if (can('UPDATE_ORDER_STATUS')) {
            // Seller/Admin: manage orders
            items.push({
                title: 'Orders',
                href: '/dashboard/orders',
                icon: ShoppingCart,
            });
        } else if (can('LIST_ORDER')) {
            // Buyer: view own orders
            items.push({
                title: 'My Orders',
                href: '/my-orders',
                icon: ShoppingCart,
            });
        }

        if (can('LIST_TRANSACTION')) {
            items.push({
                title: 'Transactions',
                href: '/dashboard/transactions',
                icon: Banknote,
            });
        }

        if (can('LIST_PAYMENT_METHOD')) {
            items.push({
                title: 'Payment Methods',
                href: '/dashboard/payment-methods',
                icon: CreditCard,
            });
        }

        // ===== USER PERSONAL SECTION =====
        // Only show personal content pages to roles that have content-related features
        // or any authenticated user who can interact with posts/products

        if (canAny('LIST_POST', 'LIST_PRODUCT', 'VIEW_DASHBOARD')) {
            items.push({
                title: 'Likes',
                href: '/dashboard/likes',
                icon: Heart,
            });

            items.push({
                title: 'Bookmarks',
                href: '/dashboard/bookmarks',
                icon: BookOpen,
            });
        }

        if (canAny('LIST_PRODUCT', 'VIEW_DASHBOARD')) {
            items.push({
                title: 'Wishlist',
                href: '/dashboard/wishlist',
                icon: Bookmark,
            });
        }

        // ===== SYSTEM SECTION =====

        if (can('LIST_ACTIVITY')) {
            items.push({
                title: 'Activities',
                href: '/dashboard/activities',
                icon: Activity,
            });
        }

        // Notifications (visible to all authenticated users)
        items.push({
            title: 'Notifications',
            href: '/dashboard/notifications',
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : null,
        });

        if (can('LIST_PLATFORM_SETTINGS')) {
            items.push({
                title: 'Settings',
                href: '/dashboard/settings',
                icon: Settings,
            });
        }

        return items;
    }, [unreadCount, user]);

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
