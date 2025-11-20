# Notification System Architecture

## Overview

The notification system uses Laravel's built-in notification infrastructure with multiple channels (database, broadcast, mail) and user-controlled preferences.

---

## Architecture

### Components

1. **Notification Classes** - Define notification content and channels
2. **Notification Settings** - User preferences per notification type
3. **Broadcasting** - Real-time delivery via Pusher/Soketi
4. **Queue System** - Asynchronous processing
5. **Frontend Listeners** - React components with Laravel Echo

---

## Notification Types

### 1. Post Notifications

#### NewPostPublished

**Trigger**: Author publishes a new post  
**Recipients**: Author's followers  
**Channels**: database, broadcast  
**Data**:

```json
{
    "post_id": 123,
    "post_title": "Beautiful Poetry",
    "author_id": 45,
    "author_name": "John Doe",
    "message": "John Doe published a new post: Beautiful Poetry"
}
```

#### PostLiked

**Trigger**: User likes a post  
**Recipients**: Post author  
**Channels**: database, broadcast  
**Data**:

```json
{
    "post_id": 123,
    "liker_id": 67,
    "liker_name": "Jane Smith",
    "message": "Jane Smith liked your post"
}
```

#### PostBookmarked

**Trigger**: User bookmarks a post  
**Recipients**: Post author  
**Channels**: database  
**Data**:

```json
{
    "post_id": 123,
    "user_id": 67,
    "user_name": "Jane Smith",
    "message": "Jane Smith bookmarked your post"
}
```

#### PostFeatured

**Trigger**: Admin features a post  
**Recipients**: Post author  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "post_id": 123,
    "featured_by": 1,
    "message": "Your post has been featured!"
}
```

### 2. Comment Notifications

#### NewComment

**Trigger**: User comments on a post  
**Recipients**: Post author  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "comment_id": 456,
    "post_id": 123,
    "commenter_id": 78,
    "commenter_name": "Alice",
    "comment_excerpt": "Great post! I really enjoyed...",
    "message": "Alice commented on your post"
}
```

#### CommentReply

**Trigger**: User replies to a comment  
**Recipients**: Parent comment author  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "comment_id": 457,
    "parent_comment_id": 456,
    "replier_id": 90,
    "replier_name": "Bob",
    "reply_excerpt": "I agree with you...",
    "message": "Bob replied to your comment"
}
```

#### CommentLiked

**Trigger**: User reacts to a comment  
**Recipients**: Comment author  
**Channels**: database, broadcast  
**Data**:

```json
{
    "comment_id": 456,
    "reactor_id": 91,
    "reactor_name": "Charlie",
    "reaction_type": "love",
    "message": "Charlie reacted to your comment"
}
```

#### CommentMentioned

**Trigger**: User mentioned in comment (@username)  
**Recipients**: Mentioned user  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "comment_id": 458,
    "post_id": 123,
    "mentioner_id": 92,
    "mentioner_name": "David",
    "message": "David mentioned you in a comment"
}
```

### 3. System Notifications

#### WelcomeNotification

**Trigger**: User completes registration  
**Recipients**: New user  
**Channels**: database, mail  
**Data**:

```json
{
    "message": "Welcome to Sahittyacanvas! Start exploring amazing literature."
}
```

#### AccountVerified

**Trigger**: Admin verifies user account  
**Recipients**: Verified user  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "message": "Congratulations! Your account has been verified.",
    "verified_at": "2025-11-20 15:30:00"
}
```

#### ContentApproved

**Trigger**: Admin approves pending content  
**Recipients**: Content author  
**Channels**: database, broadcast, mail  
**Data**:

```json
{
    "content_type": "post",
    "content_id": 123,
    "content_title": "My Story",
    "approved_by": 1,
    "message": "Your post 'My Story' has been approved and published!"
}
```

#### ContentRejected

**Trigger**: Admin rejects pending content  
**Recipients**: Content author  
**Channels**: database, mail  
**Data**:

```json
{
    "content_type": "post",
    "content_id": 123,
    "content_title": "My Story",
    "rejected_by": 1,
    "reason": "Does not meet community guidelines",
    "message": "Your post 'My Story' was not approved"
}
```

#### ReportResolved

**Trigger**: Admin resolves a user's report  
**Recipients**: Reporter  
**Channels**: database, mail  
**Data**:

```json
{
    "report_id": 789,
    "report_type": "post",
    "status": "resolved",
    "admin_notes": "Content removed for violating guidelines",
    "message": "Your report has been resolved"
}
```

### 4. Moderation Notifications (Admin/Moderator)

#### NewReportSubmitted

**Trigger**: User submits a report  
**Recipients**: All moderators  
**Channels**: database, broadcast  
**Data**:

```json
{
    "report_id": 789,
    "report_type": "post",
    "reportable_id": 123,
    "reporter_id": 45,
    "message": "New report submitted for review"
}
```

#### ContentPendingApproval

**Trigger**: New content requires approval  
**Recipients**: All moderators  
**Channels**: database, broadcast  
**Data**:

```json
{
    "content_type": "post",
    "content_id": 123,
    "author_id": 45,
    "author_name": "John Doe",
    "message": "New post pending approval from John Doe"
}
```

#### UserRegistered

**Trigger**: New user signs up  
**Recipients**: Admins  
**Channels**: database  
**Data**:

```json
{
    "user_id": 100,
    "user_name": "New User",
    "user_email": "newuser@example.com",
    "message": "New user registered: New User"
}
```

---

## Implementation

### 1. Notification Class Structure

```php
<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPostPublished extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post,
        public User $author
    ) {}

    /**
     * Determine which channels to use based on user preferences
     */
    public function via($notifiable): array
    {
        $settings = $notifiable->notificationSettings()
            ->where('notification_type', 'new_post')
            ->first();

        // If no settings or disabled, don't send
        if (!$settings || !$settings->is_enabled) {
            return [];
        }

        // Return enabled channels from user settings
        return $settings->channels ?? ['database'];
    }

    /**
     * Database channel representation
     */
    public function toArray($notifiable): array
    {
        return [
            'type' => 'new_post',
            'post_id' => $this->post->id,
            'post_title' => $this->post->title,
            'post_slug' => $this->post->slug,
            'author_id' => $this->author->id,
            'author_name' => $this->author->name,
            'author_avatar' => $this->author->getFirstMediaUrl('avatar', 'thumb'),
            'message' => "{$this->author->name} published a new post: {$this->post->title}",
            'action_url' => route('posts.show', $this->post->slug),
        ];
    }

    /**
     * Broadcast channel representation
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'new_post',
            'post_id' => $this->post->id,
            'post_title' => $this->post->title,
            'author_name' => $this->author->name,
            'message' => "{$this->author->name} published a new post",
            'action_url' => route('posts.show', $this->post->slug),
        ]);
    }

    /**
     * Mail channel representation
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New Post from {$this->author->name}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("{$this->author->name} just published a new post:")
            ->line("**{$this->post->title}**")
            ->line($this->post->excerpt)
            ->action('Read Post', route('posts.show', $this->post->slug))
            ->line('Thank you for being part of our community!');
    }
}
```

### 2. Notification Settings Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type',
        'channels',
        'is_enabled',
    ];

    protected $casts = [
        'channels' => 'array',
        'is_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Default notification settings for new users
     */
    public static function defaults(): array
    {
        return [
            'new_post' => ['channels' => ['database', 'broadcast'], 'is_enabled' => true],
            'new_comment' => ['channels' => ['database', 'broadcast', 'mail'], 'is_enabled' => true],
            'comment_reply' => ['channels' => ['database', 'broadcast', 'mail'], 'is_enabled' => true],
            'post_liked' => ['channels' => ['database'], 'is_enabled' => true],
            'post_bookmarked' => ['channels' => ['database'], 'is_enabled' => false],
            'comment_liked' => ['channels' => ['database'], 'is_enabled' => true],
            'mention' => ['channels' => ['database', 'broadcast', 'mail'], 'is_enabled' => true],
            'system' => ['channels' => ['database', 'broadcast', 'mail'], 'is_enabled' => true],
            'moderation' => ['channels' => ['database', 'broadcast'], 'is_enabled' => true],
        ];
    }
}
```

### 3. User Model Integration

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Get notification settings
     */
    public function notificationSettings()
    {
        return $this->hasMany(NotificationSetting::class);
    }

    /**
     * Create default notification settings for new user
     */
    public function createDefaultNotificationSettings()
    {
        foreach (NotificationSetting::defaults() as $type => $settings) {
            $this->notificationSettings()->create([
                'notification_type' => $type,
                'channels' => $settings['channels'],
                'is_enabled' => $settings['is_enabled'],
            ]);
        }
    }

    /**
     * Override notification routing for broadcast channel
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.Models.User.' . $this->id;
    }
}
```

### 4. Sending Notifications

```php
// When a post is published
event(new PostPublished($post));

// In PostPublished event listener
class SendPostNotifications
{
    public function handle(PostPublished $event)
    {
        $post = $event->post;
        $author = $post->user;

        // Get all followers
        $followers = $author->followers;

        // Send notification to each follower
        Notification::send($followers, new NewPostPublished($post, $author));
    }
}

// Or send to a single user
$user->notify(new PostLiked($post, $liker));

// Or send to multiple users
Notification::send($moderators, new NewReportSubmitted($report));
```

---

## Frontend Integration

### 1. Laravel Echo Setup

```typescript
// resources/js/bootstrap.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});
```

### 2. Notification Bell Component

```tsx
// resources/js/Components/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: string;
    data: {
        message: string;
        action_url?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (auth.user) {
            // Listen for new notifications
            window.Echo.private(`App.Models.User.${auth.user.id}`).notification(
                (notification: any) => {
                    // Add to notifications list
                    setNotifications((prev) => [notification, ...prev]);

                    // Increment unread count
                    setUnreadCount((prev) => prev + 1);

                    // Show toast
                    toast.info(notification.message, {
                        action: notification.action_url
                            ? {
                                  label: 'View',
                                  onClick: () =>
                                      (window.location.href =
                                          notification.action_url),
                              }
                            : undefined,
                    });

                    // Play sound (optional)
                    playNotificationSound();
                },
            );

            // Fetch existing notifications
            fetchNotifications();
        }

        return () => {
            if (auth.user) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, [auth.user]);

    const fetchNotifications = async () => {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
    };

    const markAsRead = async (notificationId: string) => {
        await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
        });

        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId
                    ? { ...n, read_at: new Date().toISOString() }
                    : n,
            ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await fetch('/api/notifications/mark-all-read', {
            method: 'POST',
        });

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
        );
        setUnreadCount(0);
    };

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Ignore errors (e.g., user hasn't interacted with page yet)
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 hover:bg-gray-100"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 max-h-[500px] w-96 overflow-y-auto rounded-lg border bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b p-4">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`cursor-pointer border-b p-4 hover:bg-gray-50 ${
                                        !notification.read_at
                                            ? 'bg-blue-50'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        if (!notification.read_at) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.data.action_url) {
                                            window.location.href =
                                                notification.data.action_url;
                                        }
                                    }}
                                >
                                    <p className="text-sm">
                                        {notification.data.message}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatTimeAgo(notification.created_at)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatTimeAgo(date: string): string {
    const seconds = Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / 1000,
    );

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
```

### 3. Notification Settings Page

```tsx
// resources/js/Pages/Settings/Notifications.tsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function NotificationSettings({ settings }) {
    const { data, setData, post, processing } = useForm({
        settings: settings,
    });

    const handleToggle = (type: string, field: string, value: any) => {
        setData('settings', {
            ...data.settings,
            [type]: {
                ...data.settings[type],
                [field]: value,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/notifications');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold">Notification Preferences</h2>

            {Object.entries(data.settings).map(
                ([type, setting]: [string, any]) => (
                    <div key={type} className="rounded-lg border p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold capitalize">
                                {type.replace('_', ' ')}
                            </h3>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={setting.is_enabled}
                                    onChange={(e) =>
                                        handleToggle(
                                            type,
                                            'is_enabled',
                                            e.target.checked,
                                        )
                                    }
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                            </label>
                        </div>

                        {setting.is_enabled && (
                            <div className="space-y-2">
                                <p className="mb-2 text-sm text-gray-600">
                                    Notify me via:
                                </p>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={setting.channels.includes(
                                            'database',
                                        )}
                                        onChange={(e) => {
                                            const channels = e.target.checked
                                                ? [
                                                      ...setting.channels,
                                                      'database',
                                                  ]
                                                : setting.channels.filter(
                                                      (c: string) =>
                                                          c !== 'database',
                                                  );
                                            handleToggle(
                                                type,
                                                'channels',
                                                channels,
                                            );
                                        }}
                                    />
                                    <span className="text-sm">
                                        In-app notifications
                                    </span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={setting.channels.includes(
                                            'broadcast',
                                        )}
                                        onChange={(e) => {
                                            const channels = e.target.checked
                                                ? [
                                                      ...setting.channels,
                                                      'broadcast',
                                                  ]
                                                : setting.channels.filter(
                                                      (c: string) =>
                                                          c !== 'broadcast',
                                                  );
                                            handleToggle(
                                                type,
                                                'channels',
                                                channels,
                                            );
                                        }}
                                    />
                                    <span className="text-sm">
                                        Real-time alerts
                                    </span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={setting.channels.includes(
                                            'mail',
                                        )}
                                        onChange={(e) => {
                                            const channels = e.target.checked
                                                ? [...setting.channels, 'mail']
                                                : setting.channels.filter(
                                                      (c: string) =>
                                                          c !== 'mail',
                                                  );
                                            handleToggle(
                                                type,
                                                'channels',
                                                channels,
                                            );
                                        }}
                                    />
                                    <span className="text-sm">Email</span>
                                </label>
                            </div>
                        )}
                    </div>
                ),
            )}

            <button
                type="submit"
                disabled={processing}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
                Save Preferences
            </button>
        </form>
    );
}
```

---

## API Routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    // Get notifications
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Mark as read
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Mark all as read
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Delete notification
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});
```

---

## Testing

```php
// tests/Feature/NotificationTest.php
public function test_user_receives_notification_when_post_is_liked()
{
    $author = User::factory()->create();
    $liker = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $author->id]);

    // Like the post
    $post->likes()->create(['user_id' => $liker->id]);

    // Assert notification was sent
    Notification::assertSentTo($author, PostLiked::class);
}

public function test_notification_respects_user_preferences()
{
    $user = User::factory()->create();

    // Disable new_post notifications
    $user->notificationSettings()->updateOrCreate(
        ['notification_type' => 'new_post'],
        ['is_enabled' => false]
    );

    $author = User::factory()->create();
    $user->follow($author);

    $post = Post::factory()->create(['user_id' => $author->id]);

    // Assert notification was NOT sent
    Notification::assertNotSentTo($user, NewPostPublished::class);
}
```

---

**Next**: See [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md) for Spatie Media Library integration.
