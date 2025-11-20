# Feature Specifications

## 1. User Management

### 1.1 User Registration & Authentication

- ✅ Email/password registration (Fortify)
- ✅ Two-factor authentication (2FA)
- Email verification required
- Social login (optional future enhancement)

### 1.2 User Profiles

- **Profile Fields**:
    - Name, username, email, bio
    - Avatar (via Spatie Media Library)
    - Banner image
    - Social media links (optional)
    - Location, website
- **Profile Stats**:
    - Posts count
    - Followers/Following count
    - Reputation score
    - Join date
    - Total views, likes received

- **Profile Actions**:
    - Edit profile
    - Change password
    - Manage 2FA
    - Delete account
    - Export data (GDPR compliance)

### 1.3 User Verification System

- Verified badge for trusted authors
- Admin-controlled verification
- Criteria: minimum posts, reputation, manual review

### 1.4 Reputation System

- Earn points for:
    - Publishing posts (+10)
    - Receiving likes (+2)
    - Receiving comments (+1)
    - Verified status (+50 bonus)
- Lose points for:
    - Deleted posts (-5)
    - Reported content (-10)
    - Spam violations (-50)

---

## 2. Role & Permissions (Spatie)

### 2.1 Default Roles

#### Super Admin

- Full system access
- Manage all users, roles, permissions
- System settings
- Cannot be deleted

#### Admin

- Manage posts, comments, categories
- Moderate content
- Manage users (except Super Admin)
- View reports and analytics

#### Moderator

- Review and approve content
- Manage reports
- Edit/delete inappropriate content
- Cannot manage users or settings

#### Author

- Create, edit, delete own posts
- Manage own comments
- View own analytics
- Cannot access admin panel

#### User (Default)

- Read content
- Comment on posts
- Like, bookmark posts
- Follow authors
- Limited posting (requires upgrade to Author)

### 2.2 Key Permissions

**Post Management**:

- `post.create`, `post.edit`, `post.delete`, `post.publish`
- `post.approve`, `post.feature`, `post.schedule`

**Comment Management**:

- `comment.create`, `comment.edit`, `comment.delete`
- `comment.approve`, `comment.moderate`

**User Management**:

- `user.view`, `user.edit`, `user.delete`, `user.verify`
- `user.assign-roles`, `user.manage-permissions`

**Category Management**:

- `category.create`, `category.edit`, `category.delete`

**Report Management**:

- `report.view`, `report.resolve`, `report.dismiss`

**Settings**:

- `settings.view`, `settings.edit`
- `moderation.toggle`, `notification.manage`

### 2.3 Permission Assignment

- Role-based permissions (default)
- Direct user permissions (override)
- Permission inheritance
- Middleware protection on routes

---

## 3. Notification System

### 3.1 Notification Types

#### Post Notifications

- `NewPostPublished` - Author you follow published a post
- `PostLiked` - Someone liked your post
- `PostBookmarked` - Someone bookmarked your post
- `PostFeatured` - Your post was featured by admin

#### Comment Notifications

- `NewComment` - New comment on your post
- `CommentReply` - Reply to your comment
- `CommentLiked` - Someone reacted to your comment
- `CommentMentioned` - You were mentioned in a comment

#### System Notifications

- `WelcomeNotification` - New user welcome
- `AccountVerified` - Account verified by admin
- `ContentApproved` - Your post/comment was approved
- `ContentRejected` - Your post/comment was rejected
- `ReportResolved` - Your report was resolved

#### Moderation Notifications (Admin/Moderator)

- `NewReportSubmitted` - New report needs review
- `ContentPendingApproval` - New content awaiting approval
- `UserRegistered` - New user registration

### 3.2 Notification Channels

#### Database Channel

- Store in `notifications` table
- Display in notification dropdown
- Mark as read/unread
- Pagination support

#### Broadcast Channel (Real-time)

- Laravel Echo + Pusher/Soketi
- Real-time notification badge updates
- Toast notifications
- Sound alerts (optional)

#### Mail Channel

- Email notifications for important events
- Digest emails (daily/weekly summary)
- Unsubscribe links

#### SMS Channel (Future)

- Critical notifications only
- Opt-in required

### 3.3 User Notification Preferences

**Settings Page**: `/settings/notifications`

**Per-Type Controls**:

```
Notification Type       | Database | Broadcast | Email
-----------------       | -------- | --------- | -----
New Posts              | ✓        | ✓         | ✗
Comments               | ✓        | ✓         | ✓
Comment Replies        | ✓        | ✓         | ✓
Likes                  | ✓        | ✗         | ✗
Bookmarks              | ✓        | ✗         | ✗
Mentions               | ✓        | ✓         | ✓
System Alerts          | ✓        | ✓         | ✓
```

**Global Controls**:

- Pause all notifications (vacation mode)
- Notification frequency (instant, hourly, daily digest)
- Quiet hours (no notifications during specific times)

### 3.4 Implementation Details

**Broadcasting Setup**:

```php
// config/broadcasting.php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'host' => env('PUSHER_HOST'),
        'port' => env('PUSHER_PORT'),
        'scheme' => env('PUSHER_SCHEME'),
    ],
],
```

**Frontend (React + Laravel Echo)**:

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});

// Listen for notifications
Echo.private(`App.Models.User.${userId}`).notification((notification) => {
    // Show toast notification
    toast.info(notification.message);
    // Update notification count
    updateNotificationBadge();
});
```

---

## 4. Blog Management

### 4.1 Post Types

#### Poetry (কবিতা)

- Single page content
- Rich text formatting
- Line breaks preserved
- Author attribution support

#### Short Story (ছোট গল্প)

- Single or multi-page
- Rich text with images
- Character limit: 5000-15000 words

#### Novel (উপন্যাস)

- Multi-page required
- Chapter-based navigation
- Table of contents
- Progress tracking for readers

#### Literature (সাহিত্য)

- General literary content
- Essays, critiques, analysis
- Rich formatting support

#### Essay (প্রবন্ধ)

- Opinion pieces
- Academic writing
- Citations support

### 4.2 Post Creation Flow

**Step 1: Choose Type**

- Select post type from grid
- Show type description and features
- Indicate multi-page support

**Step 2: Basic Info**

- Title (required)
- Excerpt/Summary (required, 150-300 chars)
- Category selection (nested dropdown)
- Tags (optional, max 5)

**Step 3: Author Attribution**

- Toggle: "Written by me" or "Famous author"
- If famous author:
    - Select from authors dropdown
    - Add attribution note
    - Show disclaimer

**Step 4: Content Editor**

- Rich text editor (Novel.sh or Tiptap)
- MDX support for advanced formatting
- Image upload (inline)
- Code blocks (for technical content)
- Embeds (YouTube, Twitter, etc.)

**Step 5: Multi-page Setup** (if applicable)

- Add pages/chapters
- Reorder pages (drag & drop)
- Page titles
- Individual page content

**Step 6: Media**

- Featured image (required)
- Alt text for accessibility
- Image cropping/resizing

**Step 7: SEO & Settings**

- Meta description
- Custom slug
- Canonical URL
- Robots meta (index/noindex)

**Step 8: Publishing Options**

- Save as draft
- Publish immediately
- Schedule for later (date/time picker)
- Submit for review (if approval required)

### 4.3 Post Editor Features

**Rich Text Toolbar**:

- Headings (H1-H6)
- Bold, Italic, Underline, Strikethrough
- Lists (ordered, unordered, checklist)
- Blockquotes
- Code blocks with syntax highlighting
- Tables
- Horizontal rules
- Links (internal, external)
- Images (upload, URL, resize)
- Embeds (YouTube, Twitter, CodePen)
- Text alignment
- Text color, background color
- Undo/Redo
- Markdown shortcuts

**Multi-page Editor**:

- Sidebar with page list
- Drag-drop page reordering
- Page preview
- Word count per page
- Auto-save every 30 seconds
- Version history (future)

**Keyboard Shortcuts**:

- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+K` - Insert link
- `Ctrl+S` - Save draft
- `Ctrl+Shift+P` - Publish

### 4.4 Post States

- **Draft** - Work in progress, not visible
- **Pending** - Submitted for review (if approval enabled)
- **Scheduled** - Queued for future publishing
- **Published** - Live and visible
- **Archived** - Hidden but not deleted
- **Deleted** - Soft deleted, recoverable

### 4.5 Scheduled Publishing

**Queue Job**: `PublishScheduledPost`

- Cron job runs every minute
- Checks `posts.scheduled_at <= now()`
- Updates status to 'published'
- Sets `published_at` timestamp
- Sends notifications to followers
- Clears relevant caches

**Cron Setup**:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('posts:publish-scheduled')
             ->everyMinute()
             ->withoutOverlapping();
}
```

### 4.6 Famous Author Attribution

**UX Flow**:

1. Toggle "Attribute to famous author"
2. Search/select author from dropdown
3. Show author card preview
4. Add optional attribution note
5. Display disclaimer: "This content is attributed to [Author Name]"

**Post Display**:

- Show both user (submitter) and famous author
- "Submitted by [User]" + "Written by [Famous Author]"
- Link to author's dedicated page
- Filter posts by famous author

**Author Page** (`/authors/{slug}`):

- Author bio, photo, dates
- List of attributed posts
- Report author button (if inappropriate)
- Follow author button

---

## 5. Category Management

### 5.1 Nested Categories

**Structure Example**:

```
Literature (সাহিত্য)
├── Poetry (কবিতা)
│   ├── Modern Poetry (আধুনিক কবিতা)
│   ├── Classical Poetry (ক্লাসিক্যাল কবিতা)
│   └── Rhyming Poetry (ছন্দবদ্ধ কবিতা)
├── Stories (গল্প)
│   ├── Short Stories (ছোট গল্প)
│   ├── Novels (উপন্যাস)
│   └── Fairy Tales (রূপকথা)
└── Essays (প্রবন্ধ)
```

**Features**:

- Unlimited nesting depth
- Self-referencing `parent_id`
- Breadcrumb navigation
- Hierarchical URLs: `/category/literature/poetry/modern-poetry`

### 5.2 Category Fields

- **Name** (Bengali & English)
- **Slug** (auto-generated, editable)
- **Description** (supports HTML)
- **Image** (banner for category page)
- **Icon** (for navigation menus)
- **Parent Category** (dropdown with hierarchy)
- **Meta Description** (SEO)
- **Position** (custom ordering)
- **Active Status** (show/hide)

### 5.3 Category Management UI

**Admin Panel**:

- Tree view with expand/collapse
- Drag-drop reordering
- Bulk actions (activate, deactivate, delete)
- Quick edit inline
- Duplicate category

**Frontend Display**:

- Mega menu with nested categories
- Category cards on homepage
- Sidebar navigation on category pages
- Tag cloud visualization

---

## 6. Engagement Features

### 6.1 Views Tracking

**Implementation**:

- Track unique views per post
- Store IP address + user ID (if logged in)
- Prevent duplicate views within 24 hours
- Update `posts.views_count` counter

**Analytics**:

- Total views
- Unique views
- Views over time (chart)
- Top viewed posts
- Geographic distribution (future)

### 6.2 Likes System

**Features**:

- One like per user per post
- Unlike functionality
- Real-time like count updates
- Notification to post author
- Like animation (heart icon)

**Display**:

- Like button with count
- List of users who liked (modal)
- "You and 42 others liked this"

### 6.3 Bookmarks

**Features**:

- Save posts for later reading
- Organize into reading lists
- Private by default
- Quick bookmark from post card
- Bookmark page with filters

**Reading Lists**:

- Create custom lists
- Add/remove posts
- Reorder posts (drag-drop)
- Share lists (optional)
- List covers (auto-generated from posts)

### 6.4 Comments System

**Features**:

- Infinite nested replies
- Rich text comments (limited formatting)
- Edit comments (within 15 minutes)
- Delete comments (soft delete)
- Report comments
- Reactions (like, love, insightful, funny)

**Comment Structure**:

```
Comment #1 (parent_id: null)
├── Reply #2 (parent_id: 1)
│   └── Reply #3 (parent_id: 2)
│       └── Reply #4 (parent_id: 3)
└── Reply #5 (parent_id: 1)
```

**Comment Display**:

- Threaded view with indentation
- "Load more replies" for deep threads
- Highlight author's comments
- Sort by: newest, oldest, most liked

**Comment Moderation**:

- Auto-approve for verified users
- Spam detection (keyword filtering)
- Admin can approve/reject
- Bulk moderation actions

### 6.5 Comment Reactions

**Reaction Types**:

- 👍 Like
- ❤️ Love
- 💡 Insightful
- 😂 Funny

**Features**:

- One reaction per user per comment
- Change reaction
- Show reaction counts
- Tooltip showing who reacted

---

## 7. Report System

### 7.1 Report Types

**Post Reports**:

- Spam or misleading
- Inappropriate content
- Copyright violation
- Plagiarism
- Misinformation

**Comment Reports**:

- Harassment or hate speech
- Spam
- Off-topic
- Inappropriate language

**Author Reports**:

- Impersonation
- Inappropriate profile
- Spam account

**Website Reports**:

- Bug or technical issue
- Feature request
- Content suggestion
- Other feedback

### 7.2 Report Flow

**User Side**:

1. Click "Report" button (context-specific)
2. Select report type from dropdown
3. Provide detailed reason (required, min 20 chars)
4. Submit report
5. Confirmation message
6. Track report status (optional)

**Admin Side**:

1. View reports in moderation queue
2. Filter by type, status, date
3. Review reported content
4. Take action:
    - Dismiss (not a violation)
    - Warn user
    - Remove content
    - Ban user (temporary/permanent)
5. Add admin notes
6. Notify reporter of outcome

### 7.3 Report Display

**Report Card**:

- Reporter info (anonymous to public)
- Reported content preview
- Report type and reason
- Timestamp
- Status badge
- Action buttons

**Report Statuses**:

- 🟡 Pending - Awaiting review
- 🔵 Reviewing - Admin is investigating
- 🟢 Resolved - Action taken
- ⚪ Dismissed - No violation found

### 7.4 Contextual Report Buttons

**Post Page**:

- Report button in post header (3-dot menu)
- Report modal overlay

**Author Page**:

- Report author button in profile header
- Reasons specific to author reports

**Comment**:

- Report icon in comment actions
- Quick report (pre-filled type)

**Footer**:

- "Report a problem" link
- General website feedback form

---

## 8. Review/Moderation System

### 8.1 Moderation Settings

**Global Toggles** (`moderation_settings` table):

| Setting                       | Description                       | Default |
| ----------------------------- | --------------------------------- | ------- |
| `posts_require_approval`      | All new posts need admin approval | `false` |
| `comments_require_approval`   | All new comments need approval    | `false` |
| `auto_approve_verified_users` | Skip approval for verified users  | `true`  |
| `enable_spam_detection`       | Auto-detect and flag spam         | `true`  |

**Admin Panel**: `/admin/settings/moderation`

- Toggle switches for each setting
- Save changes with confirmation
- Show impact (e.g., "42 posts pending approval")

### 8.2 Content Approval Workflow

**When Approval Required**:

1. User creates post/comment
2. Status set to 'pending'
3. Content not visible to public
4. Notification sent to moderators
5. Added to moderation queue

**Moderator Actions**:

- **Approve**: Publish content, notify author
- **Reject**: Send rejection reason, notify author
- **Request Changes**: Ask author to edit, notify author
- **Mark as Spam**: Flag and hide, warn user

**Bulk Actions**:

- Select multiple items
- Approve all, reject all
- Assign to moderator
- Mark as reviewed

### 8.3 Moderation Queue

**Queue Views**:

- Posts pending approval
- Comments pending approval
- Reported content
- Spam flagged items

**Filters**:

- By type (post, comment)
- By date range
- By author
- By category
- By report count

**Queue Item Display**:

- Content preview
- Author info
- Submission date
- Report count (if any)
- Quick action buttons

### 8.4 Auto-Moderation Rules

**Spam Detection**:

- Keyword blacklist (configurable)
- Link spam detection (too many links)
- Duplicate content detection
- Rapid posting detection

**Auto-Actions**:

- Flag for review
- Auto-reject (severe violations)
- Shadowban (hide from others, visible to author)
- Rate limiting (slow down spammers)

---

## 9. Static Pages Management

### 9.1 Page Types

**Pre-defined Pages**:

- About Us (already exists)
- Terms & Conditions
- Privacy Policy
- Contact Us
- FAQ
- Community Guidelines

**Custom Pages**:

- Admin can create unlimited pages
- Custom slugs
- Show/hide in footer
- Custom ordering

### 9.2 Page Editor

**Fields**:

- Title
- Slug (auto-generated)
- Content (rich text editor)
- Meta description
- Published status
- Show in footer toggle
- Position (ordering)

**Features**:

- Full rich text editing
- Image uploads
- Embed support
- Preview before publish
- SEO optimization

### 9.3 Contact Page

**Contact Form Fields**:

- Name (required)
- Email (required, validated)
- Subject (required)
- Message (required, min 50 chars)
- Captcha (spam protection)

**Submission Handling**:

- Store in `contact_submissions` table
- Send email to admin
- Auto-reply to user
- Admin dashboard to view submissions
- Mark as read/replied/archived

---

## 10. Media Management (Spatie Media Library)

### 10.1 Media Collections

**User Media**:

- `avatar` - Profile pictures (1 per user)
- `banner` - Profile banners (1 per user)

**Post Media**:

- `featured_image` - Post cover (1 per post)
- `content_images` - Inline images (unlimited)

**Category Media**:

- `category_image` - Category banner (1 per category)

**Author Media**:

- `author_photo` - Famous author photo (1 per author)

### 10.2 Image Processing

**Conversions** (auto-generated):

- `thumb` - 150x150 (square crop)
- `medium` - 800x600 (maintain aspect)
- `large` - 1920x1080 (maintain aspect)
- `webp` - WebP format for performance

**Optimization**:

- Auto-compress images (80% quality)
- Strip EXIF data
- Generate responsive images
- Lazy loading on frontend

### 10.3 Upload Limits

**File Size**:

- Avatar: 2MB max
- Banner: 5MB max
- Post images: 10MB max

**File Types**:

- Images: JPG, PNG, WebP, GIF
- Documents: PDF (for future features)

### 10.4 CDN Integration

**Setup**:

- Configure CDN URL in `.env`
- Serve media from CDN
- Automatic cache invalidation
- Fallback to local storage

---

**Next**: See [IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md) for step-by-step implementation.
