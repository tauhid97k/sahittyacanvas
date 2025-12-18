import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import {
    Bell,
    CheckCircle,
    Heart,
    MessageCircle,
    Send,
    UserPlus,
    XCircle,
} from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
}

const notificationIcons: Record<string, React.ElementType> = {
    post_published: Send,
    post_liked: Heart,
    post_commented: MessageCircle,
    comment_replied: MessageCircle,
    user_followed: UserPlus,
    content_approved: CheckCircle,
    content_rejected: XCircle,
    system: Bell,
};

const notificationColors: Record<string, string> = {
    post_published: 'text-blue-500 bg-blue-500/10',
    post_liked: 'text-red-500 bg-red-500/10',
    post_commented: 'text-green-500 bg-green-500/10',
    comment_replied: 'text-green-500 bg-green-500/10',
    user_followed: 'text-purple-500 bg-purple-500/10',
    content_approved: 'text-emerald-500 bg-emerald-500/10',
    content_rejected: 'text-orange-500 bg-orange-500/10',
    system: 'text-zinc-500 bg-zinc-500/10',
};

export function NotificationItem({
    notification,
    onMarkAsRead,
}: NotificationItemProps) {
    const Icon = notificationIcons[notification.type] || Bell;
    const colorClass =
        notificationColors[notification.type] || notificationColors.system;
    const isUnread = !notification.read_at;

    const handleClick = () => {
        if (isUnread && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const content = (
        <div
            className={cn(
                'flex items-start gap-3 p-3 transition-colors hover:bg-accent/50',
                isUnread && 'bg-accent/30',
            )}
        >
            {notification.data.user_avatar ? (
                <Avatar className="h-9 w-9">
                    <AvatarImage
                        src={notification.data.user_avatar}
                        alt={notification.data.user_name || ''}
                    />
                    <AvatarFallback className="text-xs">
                        {notification.data.user_name?.charAt(0).toUpperCase() ||
                            'U'}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        colorClass,
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <div className="flex-1 space-y-1 overflow-hidden">
                <p className="text-sm leading-tight font-medium">
                    {notification.title}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                    })}
                </p>
            </div>
            {isUnread && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
        </div>
    );

    // Just mark as read on click - no navigation from the bell popup
    return (
        <div onClick={handleClick} className="cursor-pointer">
            {content}
        </div>
    );
}
