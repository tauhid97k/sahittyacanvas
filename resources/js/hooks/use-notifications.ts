import { type Notification, type NotificationType } from '@/types/notification';
import { router, usePage } from '@inertiajs/react';
import { useEchoNotification } from '@laravel/echo-react';
import { useCallback, useState } from 'react';

interface NotificationsData {
    items: Notification[];
    unread_count: number;
}

export function useNotifications() {
    const page = usePage();
    const auth = page.props.auth as { user: { id: number } | null } | undefined;
    const serverNotifications = page.props.headerNotifications as NotificationsData | null;

    // Track real-time additions separately from server data
    const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);
    const [realtimeUnreadDelta, setRealtimeUnreadDelta] = useState<number>(0);

    // Combine server data with real-time updates
    const notifications = [
        ...realtimeNotifications,
        ...(serverNotifications?.items || []).filter(
            (n) => !realtimeNotifications.some((rn) => rn.id === n.id)
        ),
    ].slice(0, 10);

    const unreadCount = Math.max(0, (serverNotifications?.unread_count || 0) + realtimeUnreadDelta);

    // Listen for real-time notifications
    // Note: WebSocket errors are expected if Reverb server isn't running
    useEchoNotification(
        auth?.user ? `App.Models.User.${auth.user.id}` : '',
        (notification: Record<string, unknown>) => {
            const notificationType = (notification.type as string) || 'system';
            const newNotification: Notification = {
                id: notification.id as string,
                type: notificationType as NotificationType,
                title: (notification.title as string) || 'Notification',
                message: (notification.message as string) || '',
                data: notification as Notification['data'],
                read_at: null,
                created_at: new Date().toISOString(),
            };

            setRealtimeNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
            setRealtimeUnreadDelta((prev) => prev + 1);
        }
    );

    const markAsRead = useCallback((id: string) => {
        router.post(
            `/dashboard/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Update realtime notifications if it's there
                    setRealtimeNotifications((prev) =>
                        prev.map((n) =>
                            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                        )
                    );
                    setRealtimeUnreadDelta((prev) => prev - 1);
                },
            }
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        router.post(
            '/dashboard/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setRealtimeNotifications((prev) =>
                        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
                    );
                    setRealtimeUnreadDelta(0);
                },
            }
        );
    }, []);

    const deleteNotification = useCallback((id: string) => {
        router.delete(`/dashboard/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                const notification = notifications.find((n) => n.id === id);
                setRealtimeNotifications((prev) => prev.filter((n) => n.id !== id));
                if (notification && !notification.read_at) {
                    setRealtimeUnreadDelta((prev) => prev - 1);
                }
            },
        });
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}
