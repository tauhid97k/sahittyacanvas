'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import * as React from 'react';
import { NotificationItem } from './notification-item';

interface NotificationBellProps {
    className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
    const [open, setOpen] = React.useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } =
        useNotifications();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative h-9 w-9', className)}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">
                        {unreadCount > 0
                            ? `${unreadCount} unread notifications`
                            : 'Notifications'}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 sm:w-96"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Bell className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs text-muted-foreground">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="h-[400px]">
                            <div className="divide-y">
                                {notifications
                                    .slice(0, 10)
                                    .map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={markAsRead}
                                        />
                                    ))}
                            </div>
                        </ScrollArea>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-center text-sm"
                                asChild
                                onClick={() => setOpen(false)}
                            >
                                <Link href="/dashboard/notifications">
                                    View all notifications
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
