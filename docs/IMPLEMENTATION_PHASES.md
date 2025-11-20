# Implementation Phases

## Overview

This document outlines a phased approach to implementing the Sahittyacanvas blogging system. Each phase builds upon the previous one and can be completed independently.

---

## Phase 1: Foundation & Core Setup (Week 1-2)

### 1.1 Package Installation

```bash
# Install Spatie Media Library
composer require spatie/laravel-medialibrary

# Install Laravel Broadcasting dependencies
composer require pusher/pusher-php-server

# Frontend packages
npm install laravel-echo pusher-js
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
```

### 1.2 Database Migrations - Part 1

**Create migrations in order**:

```bash
# 1. Post types
php artisan make:migration create_post_types_table

# 2. Authors (famous writers)
php artisan make:migration create_authors_table

# 3. Static pages
php artisan make:migration create_static_pages_table

# 4. Moderation settings
php artisan make:migration create_moderation_settings_table

# 5. Modify existing tables
php artisan make:migration add_fields_to_users_table
php artisan make:migration add_fields_to_categories_table
php artisan make:migration add_fields_to_posts_table
php artisan make:migration add_fields_to_comments_table
```

**Run migrations**:

```bash
php artisan migrate
```

### 1.3 Seeders - Part 1

```bash
# Create seeders
php artisan make:seeder PostTypeSeeder
php artisan make:seeder AuthorSeeder
php artisan make:seeder ModerationSettingSeeder
php artisan make:seeder RolePermissionSeeder
php artisan make:seeder StaticPageSeeder

# Run seeders
php artisan db:seed
```

### 1.4 Models Creation

```bash
# Create models
php artisan make:model PostType
php artisan make:model Author
php artisan make:model StaticPage
php artisan make:model ModerationSetting
```

### 1.5 Configure Spatie Media Library

```bash
# Publish config
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"

# Run media migration
php artisan migrate
```

**Configure media collections in models**:

- User model: avatar, banner
- Post model: featured_image, content_images
- Category model: category_image
- Author model: author_photo

### 1.6 Configure Broadcasting

**Update `.env`**:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

**Uncomment in `config/app.php`**:

```php
App\Providers\BroadcastServiceProvider::class,
```

### 1.7 Setup Queue System

```bash
# Create jobs table
php artisan queue:table
php artisan migrate

# Update .env
QUEUE_CONNECTION=database
```

**Deliverables**:

- ✅ All packages installed
- ✅ Base migrations completed
- ✅ Models created with relationships
- ✅ Media library configured
- ✅ Broadcasting configured
- ✅ Queue system ready

---

## Phase 2: Role & Permission System (Week 2)

### 2.1 Configure Spatie Permission

```bash
# Publish config
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# Run migration (already done)
php artisan migrate
```

### 2.2 Create Roles & Permissions

**RolePermissionSeeder**:

```php
// Create roles
$superAdmin = Role::create(['name' => 'super-admin']);
$admin = Role::create(['name' => 'admin']);
$moderator = Role::create(['name' => 'moderator']);
$author = Role::create(['name' => 'author']);
$user = Role::create(['name' => 'user']);

// Create permissions
$permissions = [
    // Posts
    'post.create', 'post.edit', 'post.delete', 'post.publish',
    'post.approve', 'post.feature', 'post.schedule',

    // Comments
    'comment.create', 'comment.edit', 'comment.delete',
    'comment.approve', 'comment.moderate',

    // Users
    'user.view', 'user.edit', 'user.delete', 'user.verify',
    'user.assign-roles', 'user.manage-permissions',

    // Categories
    'category.create', 'category.edit', 'category.delete',

    // Reports
    'report.view', 'report.resolve', 'report.dismiss',

    // Settings
    'settings.view', 'settings.edit',
    'moderation.toggle', 'notification.manage',
];

foreach ($permissions as $permission) {
    Permission::create(['name' => $permission]);
}

// Assign permissions to roles
$superAdmin->givePermissionTo(Permission::all());
// ... assign to other roles
```

### 2.3 Middleware & Policies

```bash
# Create policies
php artisan make:policy PostPolicy --model=Post
php artisan make:policy CommentPolicy --model=Comment
php artisan make:policy CategoryPolicy --model=Category
```

**Apply middleware to routes**:

```php
Route::middleware(['auth', 'role:admin|moderator'])->group(function () {
    Route::get('/admin/posts', [AdminPostController::class, 'index']);
});
```

### 2.4 Admin Panel Routes

```bash
# Create admin controllers
php artisan make:controller Admin/DashboardController
php artisan make:controller Admin/PostController
php artisan make:controller Admin/UserController
php artisan make:controller Admin/CategoryController
php artisan make:controller Admin/ReportController
php artisan make:controller Admin/SettingsController
```

**Deliverables**:

- ✅ Roles and permissions seeded
- ✅ Policies created
- ✅ Admin routes protected
- ✅ Admin panel structure ready

---

## Phase 3: Enhanced Post System (Week 3-4)

### 3.1 Database Migrations - Part 2

```bash
# Multi-page support
php artisan make:migration create_post_pages_table

# Run migration
php artisan migrate
```

### 3.2 Update Post Model

**Add relationships**:

```php
class Post extends Model
{
    public function postType() {
        return $this->belongsTo(PostType::class);
    }

    public function author() {
        return $this->belongsTo(Author::class);
    }

    public function pages() {
        return $this->hasMany(PostPage::class)->orderBy('page_number');
    }

    public function registerMediaCollections(): void {
        $this->addMediaCollection('featured_image')
             ->singleFile()
             ->registerMediaConversions(function (Media $media) {
                 $this->addMediaConversion('thumb')->width(300)->height(200);
                 $this->addMediaConversion('large')->width(1920)->height(1080);
             });
    }
}
```

### 3.3 Post Controllers

```bash
# Create controllers
php artisan make:controller PostController
php artisan make:controller Admin/PostManagementController
```

**Key methods**:

- `index()` - List posts with filters
- `create()` - Show post creation form
- `store()` - Save new post
- `edit()` - Edit post
- `update()` - Update post
- `destroy()` - Soft delete post
- `publish()` - Publish draft
- `schedule()` - Schedule for later

### 3.4 Rich Text Editor Integration

**Install Tiptap**:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

**Create RichTextEditor component**:

```tsx
// resources/js/Components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export default function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit, Image, Link],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return <EditorContent editor={editor} />;
}
```

### 3.5 Multi-page Post Editor

**Create PostPageEditor component**:

```tsx
// Sidebar with page list
// Main editor area
// Add/remove/reorder pages
// Auto-save functionality
```

### 3.6 Scheduled Publishing

**Create job**:

```bash
php artisan make:job PublishScheduledPost
```

**Job implementation**:

```php
class PublishScheduledPost implements ShouldQueue
{
    public function handle()
    {
        Post::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->each(function ($post) {
                $post->update([
                    'status' => 'published',
                    'published_at' => now(),
                ]);

                // Notify followers
                event(new PostPublished($post));
            });
    }
}
```

**Schedule command**:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->job(new PublishScheduledPost)->everyMinute();
}
```

**Deliverables**:

- ✅ Multi-page post support
- ✅ Rich text editor integrated
- ✅ Post creation/editing workflow
- ✅ Scheduled publishing working
- ✅ Media uploads functional

---

## Phase 4: Notification System (Week 4-5)

### 4.1 Database Migrations - Part 3

```bash
# Notifications table (Laravel default)
php artisan notifications:table

# Notification settings
php artisan make:migration create_notification_settings_table

php artisan migrate
```

### 4.2 Create Notification Classes

```bash
# Create notifications
php artisan make:notification NewPostPublished
php artisan make:notification PostLiked
php artisan make:notification NewComment
php artisan make:notification CommentReply
php artisan make:notification ContentApproved
```

**Example notification**:

```php
class NewPostPublished extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Post $post) {}

    public function via($notifiable)
    {
        $settings = $notifiable->notificationSettings()
            ->where('notification_type', 'new_post')
            ->first();

        if (!$settings || !$settings->is_enabled) {
            return [];
        }

        return $settings->channels ?? ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'post_id' => $this->post->id,
            'post_title' => $this->post->title,
            'author_name' => $this->post->user->name,
            'message' => "{$this->post->user->name} published a new post: {$this->post->title}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'post_id' => $this->post->id,
            'message' => "{$this->post->user->name} published a new post",
        ]);
    }
}
```

### 4.3 Notification Settings

**Create model and controller**:

```bash
php artisan make:model NotificationSetting
php artisan make:controller Settings/NotificationSettingsController
```

**Settings page**: `/settings/notifications`

- Toggle each notification type
- Select channels (database, broadcast, email)
- Global pause/resume

### 4.4 Frontend Integration

**Install Laravel Echo**:

```bash
npm install laravel-echo pusher-js
```

**Setup Echo** (`resources/js/bootstrap.ts`):

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});
```

**Notification component**:

```tsx
// NotificationBell.tsx
useEffect(() => {
    if (user) {
        window.Echo.private(`App.Models.User.${user.id}`).notification(
            (notification) => {
                // Update notification count
                setUnreadCount((prev) => prev + 1);

                // Show toast
                toast.info(notification.message);
            },
        );
    }
}, [user]);
```

**Deliverables**:

- ✅ All notification types created
- ✅ Notification settings functional
- ✅ Real-time notifications working
- ✅ Email notifications configured
- ✅ Notification UI components

---

## Phase 5: Engagement Features (Week 5-6)

### 5.1 Database Migrations - Part 4

```bash
# Already exist: likes, bookmarks, views, comments

# New: Reading lists, follows, comment reactions
php artisan make:migration create_reading_lists_table
php artisan make:migration create_reading_list_items_table
php artisan make:migration create_follows_table
php artisan make:migration create_comment_reactions_table

php artisan migrate
```

### 5.2 Implement Features

**Likes**:

```bash
php artisan make:controller LikeController
```

- Toggle like/unlike
- Real-time count updates
- Notification to post author

**Bookmarks**:

```bash
php artisan make:controller BookmarkController
```

- Add/remove bookmarks
- Bookmark page with filters
- Reading lists

**Reading Lists**:

```bash
php artisan make:controller ReadingListController
```

- Create/edit/delete lists
- Add/remove posts
- Reorder posts
- Public/private toggle

**Follows**:

```bash
php artisan make:controller FollowController
```

- Follow/unfollow users
- Follow famous authors
- Followers/following pages
- Notification on new posts

**Comment Reactions**:

```bash
php artisan make:controller CommentReactionController
```

- React to comments
- Change reaction
- Show reaction counts

### 5.3 Frontend Components

**Create React components**:

- `LikeButton.tsx`
- `BookmarkButton.tsx`
- `FollowButton.tsx`
- `CommentReactions.tsx`
- `ReadingListManager.tsx`

**Deliverables**:

- ✅ All engagement features working
- ✅ Real-time updates
- ✅ Optimistic UI updates
- ✅ Proper notifications

---

## Phase 6: Report & Moderation System (Week 6-7)

### 6.1 Database Migrations - Part 5

```bash
php artisan make:migration create_reports_table
php artisan migrate
```

### 6.2 Report System

**Create controllers**:

```bash
php artisan make:controller ReportController
php artisan make:controller Admin/ReportManagementController
```

**Report flow**:

1. User clicks report button
2. Modal opens with report form
3. Submit report (polymorphic)
4. Admin receives notification
5. Admin reviews in moderation queue
6. Admin takes action
7. Reporter notified of outcome

### 6.3 Moderation Queue

**Admin panel pages**:

- `/admin/moderation/posts` - Pending posts
- `/admin/moderation/comments` - Pending comments
- `/admin/moderation/reports` - All reports

**Features**:

- Filter by type, status, date
- Bulk actions
- Quick approve/reject
- Add admin notes

### 6.4 Auto-Moderation

**Create middleware**:

```bash
php artisan make:middleware SpamDetection
```

**Spam detection rules**:

- Keyword blacklist
- Link spam (too many links)
- Duplicate content
- Rapid posting

**Auto-actions**:

- Flag for review
- Auto-reject
- Rate limiting

**Deliverables**:

- ✅ Report system functional
- ✅ Moderation queue working
- ✅ Auto-moderation rules active
- ✅ Admin notifications

---

## Phase 7: Static Pages & Contact (Week 7)

### 7.1 Static Pages Management

**Controllers**:

```bash
php artisan make:controller Admin/StaticPageController
php artisan make:controller StaticPageController
```

**Admin features**:

- Create/edit/delete pages
- Rich text editor
- SEO fields
- Show in footer toggle
- Reorder pages

**Frontend**:

- Dynamic routing for pages
- SEO meta tags
- Breadcrumbs

### 7.2 Contact Page

**Migration**:

```bash
php artisan make:migration create_contact_submissions_table
php artisan migrate
```

**Controller**:

```bash
php artisan make:controller ContactController
```

**Features**:

- Contact form with validation
- Captcha (Google reCAPTCHA)
- Email to admin
- Auto-reply to user
- Admin dashboard for submissions

**Deliverables**:

- ✅ Static pages CRUD
- ✅ Contact form working
- ✅ Email notifications
- ✅ Admin submission management

---

## Phase 8: Category Enhancements (Week 8)

### 8.1 Category Image Upload

**Update Category model**:

```php
public function registerMediaCollections(): void
{
    $this->addMediaCollection('category_image')
         ->singleFile()
         ->registerMediaConversions(function (Media $media) {
             $this->addMediaConversion('thumb')->width(300)->height(200);
             $this->addMediaConversion('banner')->width(1920)->height(400);
         });
}
```

### 8.2 Nested Category UI

**Frontend components**:

- `CategoryTree.tsx` - Hierarchical display
- `CategoryBreadcrumb.tsx` - Navigation
- `CategoryMegaMenu.tsx` - Dropdown menu

**Admin panel**:

- Tree view with drag-drop
- Inline editing
- Bulk actions

**Deliverables**:

- ✅ Category images working
- ✅ Nested navigation
- ✅ Admin tree view
- ✅ SEO optimization

---

## Phase 9: Author Attribution System (Week 8-9)

### 8.1 Author Management

**Admin panel**:

```bash
php artisan make:controller Admin/AuthorController
```

**Features**:

- Create/edit/delete authors
- Upload author photo
- Bio, dates, nationality
- SEO fields

### 8.2 Author Pages

**Frontend**:

```bash
php artisan make:controller AuthorController
```

**Author page** (`/authors/{slug}`):

- Author bio and photo
- List of attributed posts
- Follow button
- Report author button
- Share author profile

### 8.3 Post Attribution

**Post creation flow**:

- Toggle "Famous author" checkbox
- Search and select author
- Add attribution note
- Display on post page

**Deliverables**:

- ✅ Author CRUD functional
- ✅ Author pages live
- ✅ Post attribution working
- ✅ Follow authors feature

---

## Phase 10: Testing & Optimization (Week 9-10)

### 10.1 Write Tests

**Create tests**:

```bash
# Feature tests
php artisan make:test PostTest
php artisan make:test CommentTest
php artisan make:test NotificationTest
php artisan make:test ReportTest

# Unit tests
php artisan make:test --unit PostModelTest
php artisan make:test --unit UserModelTest
```

**Test coverage**:

- User authentication
- Post CRUD operations
- Comment system
- Notification delivery
- Report submission
- Permission checks
- API endpoints

### 10.2 Performance Optimization

**Database**:

- Add missing indexes
- Optimize queries (N+1 prevention)
- Eager loading relationships
- Query caching

**Caching**:

```php
// Cache popular posts
Cache::remember('popular_posts', 3600, function () {
    return Post::orderBy('views_count', 'desc')->take(10)->get();
});

// Cache category tree
Cache::remember('category_tree', 3600, function () {
    return Category::with('children')->whereNull('parent_id')->get();
});
```

**Queue optimization**:

- Process notifications asynchronously
- Batch operations
- Failed job handling

### 10.3 Security Audit

**Checklist**:

- ✅ CSRF protection on all forms
- ✅ XSS prevention (sanitize inputs)
- ✅ SQL injection protection (Eloquent)
- ✅ Rate limiting on APIs
- ✅ File upload validation
- ✅ Permission checks on all routes
- ✅ Secure password hashing
- ✅ 2FA enabled

### 10.4 Frontend Optimization

**Performance**:

- Code splitting
- Lazy loading components
- Image optimization (WebP, lazy load)
- Minify CSS/JS
- CDN for static assets

**Accessibility**:

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast (WCAG AA)

**Deliverables**:

- ✅ 80%+ test coverage
- ✅ All queries optimized
- ✅ Caching implemented
- ✅ Security audit passed
- ✅ Performance score >90

---

## Phase 11: Admin Dashboard & Analytics (Week 10-11)

### 11.1 Admin Dashboard

**Widgets**:

- Total users, posts, comments
- New registrations (today, week, month)
- Pending approvals count
- Unresolved reports count
- Popular posts chart
- Traffic analytics

### 11.2 Analytics

**Post analytics**:

- Views over time (chart)
- Engagement rate
- Top performing posts
- Category distribution

**User analytics**:

- User growth chart
- Active users
- Top authors
- User retention

**Deliverables**:

- ✅ Admin dashboard complete
- ✅ Analytics charts
- ✅ Export reports (CSV, PDF)

---

## Phase 12: Final Polish & Launch (Week 11-12)

### 12.1 UI/UX Refinement

**Review and improve**:

- Mobile responsiveness
- Loading states
- Error messages
- Empty states
- Success messages
- Animations

### 12.2 Documentation

**Create docs**:

- User guide
- Admin manual
- API documentation
- Deployment guide

### 12.3 Deployment Preparation

**Checklist**:

- ✅ Environment variables configured
- ✅ Database backups automated
- ✅ Queue workers running
- ✅ Cron jobs scheduled
- ✅ SSL certificate installed
- ✅ CDN configured
- ✅ Error tracking (Sentry)
- ✅ Monitoring (Laravel Telescope)

### 12.4 Launch

**Pre-launch**:

- Beta testing with select users
- Fix critical bugs
- Performance testing
- Security scan

**Launch day**:

- Deploy to production
- Monitor errors
- Watch performance
- Gather user feedback

**Post-launch**:

- Address user feedback
- Fix bugs
- Plan next features

---

## Summary Timeline

| Phase | Duration   | Focus                  |
| ----- | ---------- | ---------------------- |
| 1     | Week 1-2   | Foundation & Setup     |
| 2     | Week 2     | Roles & Permissions    |
| 3     | Week 3-4   | Enhanced Posts         |
| 4     | Week 4-5   | Notifications          |
| 5     | Week 5-6   | Engagement Features    |
| 6     | Week 6-7   | Reports & Moderation   |
| 7     | Week 7     | Static Pages           |
| 8     | Week 8     | Categories             |
| 9     | Week 8-9   | Author Attribution     |
| 10    | Week 9-10  | Testing & Optimization |
| 11    | Week 10-11 | Admin Dashboard        |
| 12    | Week 11-12 | Polish & Launch        |

**Total**: ~12 weeks (3 months)

---

**Next**: See specialized documentation for detailed implementation guides.
