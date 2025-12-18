export type NotificationType =
    | 'post_published'
    | 'post_liked'
    | 'post_commented'
    | 'comment_replied'
    | 'user_followed'
    | 'content_approved'
    | 'content_rejected'
    | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: {
        post_id?: number;
        post_title?: string;
        comment_id?: number;
        user_id?: number;
        user_name?: string;
        user_avatar?: string;
        action_url?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
}

export interface NotificationGroup {
    date: string;
    notifications: Notification[];
}
