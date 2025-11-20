# Database Schema Design

## Overview

This document outlines the complete database schema for the Sahittyacanvas blogging platform, including new tables to be created and modifications to existing tables.

## Existing Tables (Already Implemented)

### ✅ users

- `id`, `name`, `username`, `email`, `bio`, `banner`
- `email_verified_at`, `password`, `two_factor_*`
- `created_at`, `updated_at`

### ✅ categories

- `id`, `name_bn`, `name_en`, `slug`, `description`
- `parent_id` (self-referencing for nesting)
- `icon`, `is_active`
- `created_at`, `updated_at`

### ✅ posts

- `id`, `user_id`, `category_id`, `title`, `slug`, `excerpt`
- `content`, `featured_image`, `status`, `published_at`
- `views_count`, `likes_count`, `comments_count`
- `created_at`, `updated_at`, `deleted_at`

### ✅ comments

- `id`, `post_id`, `user_id`, `parent_id`, `content`
- `approved`, `created_at`, `updated_at`, `deleted_at`

### ✅ likes

- `id`, `user_id`, `post_id`
- `created_at`, `updated_at`

### ✅ bookmarks

- `id`, `user_id`, `post_id`
- `created_at`, `updated_at`

### ✅ views

- `id`, `post_id`, `user_id`, `ip_address`, `user_agent`
- `created_at`, `updated_at`

### ✅ roles & permissions (Spatie)

- `roles`, `permissions`, `role_has_permissions`, `model_has_roles`, `model_has_permissions`

## New Tables to Create

### 1. authors (Famous Writers)

```sql
CREATE TABLE authors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_bn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
);
```

**Purpose**: Store famous writers like Rabindranath Tagore for attribution.

---

### 2. post_types

```sql
CREATE TABLE post_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    supports_multi_page BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_slug (slug)
);
```

**Purpose**: Define content types (poetry, story, literature, novel, etc.)

**Seed Data**:

- Poetry (কবিতা)
- Short Story (ছোট গল্প)
- Novel (উপন্যাস) - multi-page
- Literature (সাহিত্য)
- Essay (প্রবন্ধ)

---

### 3. post_pages (Multi-page Support)

```sql
CREATE TABLE post_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255),
    content LONGTEXT NOT NULL,
    page_number INT UNSIGNED NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_page (post_id, page_number),
    UNIQUE KEY unique_post_page (post_id, page_number)
);
```

**Purpose**: Support multi-page stories/novels with individual page content.

---

### 4. notifications

```sql
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT UNSIGNED NOT NULL,
    data JSON NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_notifiable (notifiable_type, notifiable_id),
    INDEX idx_read_at (read_at)
);
```

**Purpose**: Laravel's default notification table for database channel.

---

### 5. notification_settings

```sql
CREATE TABLE notification_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    channels JSON NOT NULL DEFAULT ('["database"]'),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification (user_id, notification_type),
    INDEX idx_user_id (user_id)
);
```

**Purpose**: User preferences for notification types and channels.

**Notification Types**:

- `new_post` - New post from followed author
- `new_comment` - Comment on user's post
- `comment_reply` - Reply to user's comment
- `post_liked` - Someone liked user's post
- `post_bookmarked` - Someone bookmarked user's post
- `mention` - User mentioned in comment
- `system` - System-level notifications
- `moderation` - Content moderation updates

---

### 6. reports

```sql
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT UNSIGNED NOT NULL,
    reportable_type VARCHAR(255) NOT NULL,
    reportable_id BIGINT UNSIGNED NOT NULL,
    report_type ENUM('spam', 'inappropriate', 'copyright', 'harassment', 'misinformation', 'other') NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'reviewing', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by BIGINT UNSIGNED,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reportable (reportable_type, reportable_id),
    INDEX idx_status (status),
    INDEX idx_reporter (reporter_id)
);
```

**Purpose**: Handle reports for posts, comments, authors, and general website issues.

**Reportable Types**:

- `App\Models\Post`
- `App\Models\Comment`
- `App\Models\Author`
- `App\Models\User`
- `Website` (general issues)

---

### 7. follows

```sql
CREATE TABLE follows (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT UNSIGNED NOT NULL,
    followable_type VARCHAR(255) NOT NULL,
    followable_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, followable_type, followable_id),
    INDEX idx_followable (followable_type, followable_id),
    INDEX idx_follower (follower_id)
);
```

**Purpose**: Allow users to follow other users or famous authors.

---

### 8. reading_lists

```sql
CREATE TABLE reading_lists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public)
);
```

**Purpose**: Custom reading lists/collections for users.

---

### 9. reading_list_items

```sql
CREATE TABLE reading_list_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reading_list_id BIGINT UNSIGNED NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    position INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (reading_list_id) REFERENCES reading_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_list_post (reading_list_id, post_id),
    INDEX idx_reading_list (reading_list_id)
);
```

**Purpose**: Items in reading lists with custom ordering.

---

### 10. static_pages

```sql
CREATE TABLE static_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content LONGTEXT NOT NULL,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    show_in_footer BOOLEAN DEFAULT TRUE,
    position INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_slug (slug),
    INDEX idx_is_published (is_published)
);
```

**Purpose**: Manage static pages (Terms, Privacy, Contact, etc.)

**Seed Data**:

- Terms & Conditions
- Privacy Policy
- Contact Us
- FAQ

---

### 11. contact_submissions

```sql
CREATE TABLE contact_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

**Purpose**: Store contact form submissions.

---

### 12. moderation_settings

```sql
CREATE TABLE moderation_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

**Purpose**: Global moderation toggles.

**Settings**:

- `posts_require_approval` - New posts need admin review
- `comments_require_approval` - New comments need approval
- `auto_approve_verified_users` - Skip approval for verified users
- `enable_spam_detection` - Auto-detect spam content

---

### 13. comment_reactions

```sql
CREATE TABLE comment_reactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    reaction_type ENUM('like', 'love', 'insightful', 'funny') NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comment_user_reaction (comment_id, user_id),
    INDEX idx_comment_id (comment_id)
);
```

**Purpose**: React to comments with different emotion types.

---

## Modifications to Existing Tables

### posts (Add columns)

```sql
ALTER TABLE posts
ADD COLUMN post_type_id BIGINT UNSIGNED AFTER category_id,
ADD COLUMN author_id BIGINT UNSIGNED AFTER user_id,
ADD COLUMN is_multi_page BOOLEAN DEFAULT FALSE AFTER content,
ADD COLUMN scheduled_at TIMESTAMP NULL AFTER published_at,
ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMP NULL,
ADD COLUMN approved_by BIGINT UNSIGNED,
ADD FOREIGN KEY (post_type_id) REFERENCES post_types(id) ON DELETE SET NULL,
ADD FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_post_type (post_type_id),
ADD INDEX idx_author (author_id),
ADD INDEX idx_scheduled (scheduled_at),
ADD INDEX idx_status_published (status, published_at);
```

**New Fields**:

- `post_type_id` - Link to post type (poetry, story, etc.)
- `author_id` - Famous author attribution (nullable)
- `is_multi_page` - Flag for multi-page content
- `scheduled_at` - Scheduled publishing time
- `requires_approval` - Moderation flag
- `approved_at`, `approved_by` - Approval tracking

---

### categories (Add columns)

```sql
ALTER TABLE categories
ADD COLUMN image VARCHAR(255) AFTER icon,
ADD COLUMN meta_description TEXT AFTER description,
ADD COLUMN position INT UNSIGNED DEFAULT 0 AFTER is_active;
```

**New Fields**:

- `image` - Category image/banner
- `meta_description` - SEO description
- `position` - Custom ordering

---

### users (Add columns)

```sql
ALTER TABLE users
ADD COLUMN avatar VARCHAR(255) AFTER banner,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE AFTER email_verified_at,
ADD COLUMN reputation_score INT DEFAULT 0,
ADD COLUMN posts_count INT UNSIGNED DEFAULT 0,
ADD COLUMN followers_count INT UNSIGNED DEFAULT 0,
ADD COLUMN following_count INT UNSIGNED DEFAULT 0,
ADD INDEX idx_is_verified (is_verified),
ADD INDEX idx_reputation (reputation_score);
```

**New Fields**:

- `avatar` - Profile picture
- `is_verified` - Verified author badge
- `reputation_score` - User reputation points
- `*_count` - Cached counters

---

### comments (Add columns)

```sql
ALTER TABLE comments
ADD COLUMN reactions_count INT UNSIGNED DEFAULT 0 AFTER approved,
ADD INDEX idx_approved_created (approved, created_at);
```

---

## Media Library Tables (Spatie)

Will be created automatically when installing `spatie/laravel-medialibrary`:

### media

```sql
CREATE TABLE media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    uuid CHAR(36),
    collection_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255),
    disk VARCHAR(255) NOT NULL,
    conversions_disk VARCHAR(255),
    size BIGINT UNSIGNED NOT NULL,
    manipulations JSON NOT NULL,
    custom_properties JSON NOT NULL,
    generated_conversions JSON NOT NULL,
    responsive_images JSON NOT NULL,
    order_column INT UNSIGNED,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_model (model_type, model_id),
    INDEX idx_uuid (uuid)
);
```

**Collections**:

- `avatar` - User avatars
- `banner` - User/category banners
- `featured_image` - Post featured images
- `content_images` - Inline content images
- `author_photo` - Famous author photos

---

## Indexes Strategy

### High-Priority Indexes (Already Applied)

- Primary keys on all tables
- Foreign keys with indexes
- Unique constraints (email, username, slug)
- Composite indexes for common queries

### Additional Recommended Indexes

```sql
-- For post queries
CREATE INDEX idx_posts_status_published_type ON posts(status, published_at, post_type_id);
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- For comment queries
CREATE INDEX idx_comments_post_approved_created ON comments(post_id, approved, created_at);

-- For notification queries
CREATE INDEX idx_notifications_unread ON notifications(notifiable_type, notifiable_id, read_at);

-- For report queries
CREATE INDEX idx_reports_status_created ON reports(status, created_at);
```

---

## Migration Order

1. ✅ Existing tables (already migrated)
2. `post_types` (no dependencies)
3. `authors` (no dependencies)
4. `static_pages` (no dependencies)
5. `moderation_settings` (no dependencies)
6. Modify `users` table
7. Modify `categories` table
8. Modify `posts` table
9. `post_pages` (depends on posts)
10. `notifications` (Laravel default)
11. `notification_settings` (depends on users)
12. `reports` (depends on users)
13. `follows` (depends on users)
14. `reading_lists` (depends on users)
15. `reading_list_items` (depends on reading_lists, posts)
16. `contact_submissions` (no dependencies)
17. `comment_reactions` (depends on comments, users)
18. Install Spatie Media Library (creates `media` table)

---

## Database Relationships Summary

### User Relationships

- `hasMany`: posts, comments, likes, bookmarks, reports, reading_lists
- `morphMany`: notifications, follows (as follower)
- `belongsToMany`: roles, permissions

### Post Relationships

- `belongsTo`: user, category, post_type, author
- `hasMany`: comments, likes, bookmarks, views, pages
- `morphMany`: reports, media

### Category Relationships

- `belongsTo`: parent (self)
- `hasMany`: children (self), posts
- `morphOne`: media (for image)

### Comment Relationships

- `belongsTo`: post, user, parent (self)
- `hasMany`: replies (self), reactions
- `morphMany`: reports

### Author Relationships

- `hasMany`: posts
- `morphMany`: follows, media

---

**Next**: See [FEATURES.md](./FEATURES.md) for detailed feature specifications.
