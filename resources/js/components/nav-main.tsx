import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const isActive = (href: NavItem['href']) => {
        const url = resolveUrl(href);
        const currentPath = page.url.split('?')[0]; // Remove query string

        // Exact match for root dashboard
        if (url === '/dashboard') {
            return currentPath === '/dashboard';
        }

        // Prefix match for other routes
        return currentPath.startsWith(url);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span className="flex-1">{item.title}</span>
                                {item.badge != null && item.badge !== 0 && (
                                    <span
                                        className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium ${isActive(item.href) ? 'bg-white text-black dark:bg-white dark:text-black' : 'bg-primary text-white dark:bg-primary dark:text-white'}`}
                                    >
                                        {typeof item.badge === 'number' &&
                                        item.badge > 99
                                            ? '99+'
                                            : item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
