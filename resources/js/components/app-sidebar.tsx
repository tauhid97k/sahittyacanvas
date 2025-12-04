import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    Feather,
    LayoutGrid,
    List,
    PenBox,
    Shield,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';

const mainNavItems: NavItem[] = [
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
        href: '#',
        icon: Feather,
    },
    {
        title: 'Posts',
        href: '#',
        icon: PenBox,
    },
    {
        title: 'Activities',
        href: '#',
        icon: Activity,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Settings',
//         href: '#',
//         icon: Settings,
//     },
// ];

export function AppSidebar() {
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
