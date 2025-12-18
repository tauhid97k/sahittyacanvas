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
    Bell,
    Feather,
    LayoutGrid,
    List,
    PenBox,
    Shield,
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
                href: '#',
                icon: User,
            },
            {
                title: 'Roles',
                href: '#',
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
