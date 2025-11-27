# Database Schema Design

## Overview

This document outlines the complete database schema for the Sahittyacanvas blogging platform. The schema is designed for a Bengali literature platform with multi-page post support, social features, and content moderation.

---

## Existing Tables (From Laravel Starter Kit)

### ✅ users (base)

- `id`, `name`, `email`, `email_verified_at`, `password`
- `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`
- `remember_token`, `created_at`, `updated_at`

### ✅ roles & permissions (Spatie Laravel Permission)

- [GitHub](https://github.com/spatie/laravel-permission)
- `roles`, `permissions`, `role_has_permissions`, `model_has_roles`, `model_has_permissions`

### ✅ media (Spatie Media Library)

- [GitHub](https://github.com/spatie/laravel-medialibrary)
- Polymorphic media attachments for all models

### ✅ activity_log (Spatie Laravel Activitylog)

- [GitHub](https://github.com/spatie/laravel-activitylog)
- Audit trail for all model changes and user actions
- Tracks causer, subject, properties (old/new values)
- **Migrated**: `activity_log` table with `event` and `batch_uuid` columns

### ✅ laravisit_visits (Laravisit)

- [GitHub](https://github.com/coderflexx/laravisit)
- Visit tracking with IP, user, session, custom data
- Popular timeframe queries (today, week, month, year)
- Configurable intervals (hourly, daily, weekly, monthly)
- **Usage**: Add `HasVisits` trait + `CanVisit` interface to Post model

### ✅ seo (Laravel SEO)

- [GitHub](https://github.com/ralphjsmit/laravel-seo)
- Polymorphic SEO for any model (Post, Category, Author, etc.)
- Auto-generates: title, meta description, OpenGraph, Twitter Cards
- JSON-LD structured data (Article, BreadcrumbList, FAQPage)
- **Usage**: Add `HasSEO` trait + `getDynamicSEOData()` method to models

---

## New Tables

### 1. post_types

Content type classification for posts.

| Column      | Type            | Constraints        | Description             |
| ----------- | --------------- | ------------------ | ----------------------- |
| id          | BIGINT UNSIGNED | PK, AUTO_INCREMENT |                         |
| name        | VARCHAR(100)    | NOT NULL           | Display name            |
| slug        | VARCHAR(100)    | UNIQUE, NOT NULL   | URL-friendly identifier |
| description | TEXT            | NULLABLE           |                         |
| icon        | VARCHAR(50)     | NULLABLE           | Icon class/name         |
| is_active   | BOOLEAN         | DEFAULT TRUE       |                         |
| created_at  | TIMESTAMP       | NULLABLE           |                         |
| updated_at  | TIMESTAMP       | NULLABLE           |                         |

**Indexes**: `slug`, `is_active`

**Seed Data**: কবিতা (Poetry), ছোট গল্প (Short Story), উপন্যাস (Novel), সাহিত্য (Literature), প্রবন্ধ (Essay)

---

### 2. authors

Famous writers for content attribution.

| Column      | Type            | Constraints        | Description             |
| ----------- | --------------- | ------------------ | ----------------------- |
| id          | BIGINT UNSIGNED | PK, AUTO_INCREMENT |                         |
| name_bn     | VARCHAR(255)    | NOT NULL           | Bengali name            |
| name_en     | VARCHAR(255)    | NOT NULL           | English name            |
| slug        | VARCHAR(255)    | UNIQUE, NOT NULL   | URL-friendly identifier |
| bio         | TEXT            | NULLABLE           | Biography               |
| birth_date  | DATE            | NULLABLE           |                         |
| death_date  | DATE            | NULLABLE           |                         |
| nationality | VARCHAR(100)    | NULLABLE           |                         |
| is_active   | BOOLEAN         | DEFAULT TRUE       |                         |
| created_at  | TIMESTAMP       | NULLABLE           |                         |
| updated_at  | TIMESTAMP       | NULLABLE           |                         |

**Indexes**: `slug`, `is_active`

---

### 3. categories

Nested categories with SEO support.

| Column           | Type            | Constraints                  | Description                  |
| ---------------- | --------------- | ---------------------------- | ---------------------------- |
| id               | BIGINT UNSIGNED | PK, AUTO_INCREMENT           |                              |
| name_bn          | VARCHAR(255)    | NOT NULL                     | Bengali name                 |
| name_en          | VARCHAR(255)    | NOT NULL                     | English name                 |
| slug             | VARCHAR(255)    | UNIQUE, NOT NULL             | URL-friendly identifier      |
| description      | TEXT            | NULLABLE                     |                              |
| meta_description | TEXT            | NULLABLE                     | SEO description              |
| parent_id        | BIGINT UNSIGNED | FK → categories.id, NULLABLE | Self-referencing for nesting |
| icon             | VARCHAR(50)     | NULLABLE                     |                              |
| image            | VARCHAR(255)    | NULLABLE                     | Category banner              |
| is_active        | BOOLEAN         | DEFAULT TRUE                 |                              |
| position         | INT UNSIGNED    | DEFAULT 0                    | Display order                |
| created_at       | TIMESTAMP       | NULLABLE                     |                              |
| updated_at       | TIMESTAMP       | NULLABLE                     |                              |

**Indexes**: `slug`, `parent_id`, `is_active`, `position`

**Foreign Keys**: `parent_id` → `categories(id)` ON DELETE SET NULL

---

### 4. users (modifications)

Additional profile columns for the existing users table.

| Column           | Type         | Constraints      | Description           |
| ---------------- | ------------ | ---------------- | --------------------- |
| username         | VARCHAR(255) | UNIQUE, NULLABLE | Public username       |
| bio              | TEXT         | NULLABLE         | User biography        |
| avatar           | VARCHAR(255) | NULLABLE         | Profile picture path  |
| banner           | VARCHAR(255) | NULLABLE         | Profile banner path   |
| is_verified      | BOOLEAN      | DEFAULT FALSE    | Verified author badge |
| reputation_score | INT          | DEFAULT 0        | Gamification score    |
| posts_count      | INT UNSIGNED | DEFAULT 0        | Cached counter        |
| followers_count  | INT UNSIGNED | DEFAULT 0        | Cached counter        |
| following_count  | INT UNSIGNED | DEFAULT 0        | Cached counter        |

**Indexes**: `username`, `is_verified`, `reputation_score`

---

### 5. posts

Main content table with moderation support.

| Column            | Type            | Constraints                  | Description                         |
| ----------------- | --------------- | ---------------------------- | ----------------------------------- |
| id                | BIGINT UNSIGNED | PK, AUTO_INCREMENT           |                                     |
| user_id           | BIGINT UNSIGNED | FK → users.id, NOT NULL      | Post author                         |
| author_id         | BIGINT UNSIGNED | FK → authors.id, NULLABLE    | Famous writer attribution           |
| category_id       | BIGINT UNSIGNED | FK → categories.id, NULLABLE |                                     |
| post_type_id      | BIGINT UNSIGNED | FK → post_types.id, NULLABLE |                                     |
| title             | VARCHAR(255)    | NOT NULL                     |                                     |
| slug              | VARCHAR(255)    | UNIQUE, NOT NULL             |                                     |
| excerpt           | TEXT            | NULLABLE                     | Short description                   |
| featured_image    | VARCHAR(255)    | NULLABLE                     |                                     |
| status            | ENUM            | DEFAULT 'draft'              | draft, pending, published, archived |
| published_at      | TIMESTAMP       | NULLABLE                     |                                     |
| requires_approval | BOOLEAN         | DEFAULT FALSE                | Moderation flag                     |
| approved_at       | TIMESTAMP       | NULLABLE                     |                                     |
| approved_by       | BIGINT UNSIGNED | FK → users.id, NULLABLE      | Admin who approved                  |
| likes_count       | INT UNSIGNED    | DEFAULT 0                    | Cached counter                      |
| comments_count    | INT UNSIGNED    | DEFAULT 0                    | Cached counter                      |
| bookmarks_count   | INT UNSIGNED    | DEFAULT 0                    | Cached counter                      |
| created_at        | TIMESTAMP       | NULLABLE                     |                                     |
| updated_at        | TIMESTAMP       | NULLABLE                     |                                     |
| deleted_at        | TIMESTAMP       | NULLABLE                     | Soft delete                         |

**Indexes**: `status`, `published_at`, `(status, published_at)`, `(user_id, status)`, `(category_id, status)`, `(post_type_id, status)`, `(author_id, status)`

**Foreign Keys**:

- `user_id` → `users(id)` ON DELETE CASCADE
- `author_id` → `authors(id)` ON DELETE SET NULL
- `category_id` → `categories(id)` ON DELETE SET NULL
- `post_type_id` → `post_types(id)` ON DELETE SET NULL
- `approved_by` → `users(id)` ON DELETE SET NULL

> **Note**: `views_count` is handled dynamically by **Laravisit** package via `Post::withTotalVisitCount()`.

> **Note**: SEO (title, description, OpenGraph, Twitter Cards, JSON-LD) is handled by **Laravel SEO** package via `HasSEO` trait and polymorphic `seo` table.

---

### 6. post_pages

Multi-page content support using order-based system.

| Column       | Type            | Constraints             | Description             |
| ------------ | --------------- | ----------------------- | ----------------------- |
| id           | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |                         |
| post_id      | BIGINT UNSIGNED | FK → posts.id, NOT NULL |                         |
| title        | VARCHAR(255)    | NULLABLE                | Chapter/page title      |
| content      | LONGTEXT        | NOT NULL                | Page content (MDX)      |
| order        | INT UNSIGNED    | DEFAULT 10              | Order-based positioning |
| status       | ENUM            | DEFAULT 'draft'         | draft, published        |
| published_at | TIMESTAMP       | NULLABLE                |                         |
| created_at   | TIMESTAMP       | NULLABLE                |                         |
| updated_at   | TIMESTAMP       | NULLABLE                |                         |
| deleted_at   | TIMESTAMP       | NULLABLE                | Soft delete             |

**Indexes**: `(post_id, order)`, `(post_id, status)`

**Unique Constraints**: `(post_id, order)`

**Foreign Keys**: `post_id` → `posts(id)` ON DELETE CASCADE

**Order System Notes**:

- Pages use `order` field (10, 20, 30...) instead of sequential page numbers
- Insert between pages: use fractional order (e.g., 15 between 10 and 20)
- Frontend calculates display page numbers from sorted order
- Soft deletes maintain stable references
- Background job can rebalance order gaps periodically

---

### 7. comments

Nested comments with moderation. Uses **Laravel Adjacency List** ([GitHub](https://github.com/staudenmeir/laravel-adjacency-list)) for efficient recursive queries.

| Column        | Type            | Constraints                | Description        |
| ------------- | --------------- | -------------------------- | ------------------ |
| id            | BIGINT UNSIGNED | PK, AUTO_INCREMENT         |                    |
| post_id       | BIGINT UNSIGNED | FK → posts.id, NOT NULL    |                    |
| user_id       | BIGINT UNSIGNED | FK → users.id, NOT NULL    |                    |
| parent_id     | BIGINT UNSIGNED | FK → comments.id, NULLABLE | For nested replies |
| content       | TEXT            | NOT NULL                   | Supports @mentions |
| is_approved   | BOOLEAN         | DEFAULT FALSE              | Moderation status  |
| replies_count | INT UNSIGNED    | DEFAULT 0                  | Cached counter     |
| created_at    | TIMESTAMP       | NULLABLE                   |                    |
| updated_at    | TIMESTAMP       | NULLABLE                   |                    |
| deleted_at    | TIMESTAMP       | NULLABLE                   | Soft delete        |

**Indexes**: `(post_id, is_approved, created_at)`, `(user_id, created_at)`, `parent_id`

**Foreign Keys**:

- `post_id` → `posts(id)` ON DELETE CASCADE
- `user_id` → `users(id)` ON DELETE CASCADE
- `parent_id` → `comments(id)` ON DELETE CASCADE

**Laravel Adjacency List Features** ✅ (Package Installed):

- `HasRecursiveRelationships` trait on Comment model
- `ancestors()` - Get all parent comments up to root
- `descendants()` - Get all nested replies recursively
- `siblings()` - Get sibling comments at same level
- `depth` - Automatic depth calculation
- `tree()` - Get entire comment tree efficiently using CTEs
- No N+1 queries for nested comment loading
- Also usable on `Category` model for nested categories

**Mention System**: Parse `@username` in content, create notifications for mentioned users.

---

### 8. likes

Post likes (one per user per post).

| Column     | Type            | Constraints             | Description |
| ---------- | --------------- | ----------------------- | ----------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |             |
| user_id    | BIGINT UNSIGNED | FK → users.id, NOT NULL |             |
| post_id    | BIGINT UNSIGNED | FK → posts.id, NOT NULL |             |
| created_at | TIMESTAMP       | NULLABLE                |             |
| updated_at | TIMESTAMP       | NULLABLE                |             |

**Unique Constraints**: `(user_id, post_id)`

**Indexes**: `post_id`

**Foreign Keys**:

- `user_id` → `users(id)` ON DELETE CASCADE
- `post_id` → `posts(id)` ON DELETE CASCADE

---

### 9. bookmarks

Post bookmarks (one per user per post).

| Column     | Type            | Constraints             | Description |
| ---------- | --------------- | ----------------------- | ----------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |             |
| user_id    | BIGINT UNSIGNED | FK → users.id, NOT NULL |             |
| post_id    | BIGINT UNSIGNED | FK → posts.id, NOT NULL |             |
| created_at | TIMESTAMP       | NULLABLE                |             |
| updated_at | TIMESTAMP       | NULLABLE                |             |

**Unique Constraints**: `(user_id, post_id)`

**Indexes**: `post_id`

**Foreign Keys**:

- `user_id` → `users(id)` ON DELETE CASCADE
- `post_id` → `posts(id)` ON DELETE CASCADE

---

### ~~10. views~~ → REPLACED BY LARAVISIT

> **Note**: This table is replaced by **Laravisit** package (`coderflexx/laravisit`).
> The package provides its own `laravisit_visits` table with more features.

**Laravisit Features**:

- `HasVisits` trait on Post model
- `$post->visit()` - Record a visit
- `$post->visit()->withIp()->withUser()->withData(['referrer' => 'google'])`
- Configurable intervals: `hourlyInterval()`, `dailyInterval()`, `weeklyInterval()`, `monthlyInterval()`
- Popular queries: `Post::popularToday()`, `Post::popularThisWeek()`, `Post::popularAllTime()`
- `Post::withTotalVisitCount()->get()` - Include visit counts
- Unique visits per interval (prevents duplicate counting)

---

### 11. follows

Polymorphic follows with notification preferences (Twitter-like system).

| Column           | Type            | Constraints             | Description                |
| ---------------- | --------------- | ----------------------- | -------------------------- |
| id               | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |                            |
| follower_id      | BIGINT UNSIGNED | FK → users.id, NOT NULL | User who follows           |
| followable_type  | VARCHAR(255)    | NOT NULL                | Model class (User, Author) |
| followable_id    | BIGINT UNSIGNED | NOT NULL                | Model ID                   |
| notify_new_posts | BOOLEAN         | DEFAULT TRUE            | Get notified on new posts  |
| notify_via_email | BOOLEAN         | DEFAULT FALSE           | Email notifications        |
| notify_via_push  | BOOLEAN         | DEFAULT TRUE            | Push notifications         |
| created_at       | TIMESTAMP       | NULLABLE                |                            |
| updated_at       | TIMESTAMP       | NULLABLE                |                            |

**Unique Constraints**: `(follower_id, followable_type, followable_id)`

**Indexes**: `(followable_type, followable_id)`

**Foreign Keys**: `follower_id` → `users(id)` ON DELETE CASCADE

**Followable Types**: `App\Models\User`, `App\Models\Author`

---

### 12. reading_lists

Custom reading lists/collections.

| Column      | Type            | Constraints             | Description       |
| ----------- | --------------- | ----------------------- | ----------------- |
| id          | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |                   |
| user_id     | BIGINT UNSIGNED | FK → users.id, NOT NULL |                   |
| name        | VARCHAR(255)    | NOT NULL                | List name         |
| description | TEXT            | NULLABLE                |                   |
| is_public   | BOOLEAN         | DEFAULT FALSE           | Public visibility |
| created_at  | TIMESTAMP       | NULLABLE                |                   |
| updated_at  | TIMESTAMP       | NULLABLE                |                   |

**Indexes**: `user_id`, `is_public`

**Foreign Keys**: `user_id` → `users(id)` ON DELETE CASCADE

---

### 13. reading_list_items

Items in reading lists with ordering.

| Column          | Type            | Constraints                     | Description   |
| --------------- | --------------- | ------------------------------- | ------------- |
| id              | BIGINT UNSIGNED | PK, AUTO_INCREMENT              |               |
| reading_list_id | BIGINT UNSIGNED | FK → reading_lists.id, NOT NULL |               |
| post_id         | BIGINT UNSIGNED | FK → posts.id, NOT NULL         |               |
| position        | INT UNSIGNED    | DEFAULT 0                       | Display order |
| created_at      | TIMESTAMP       | NULLABLE                        |               |
| updated_at      | TIMESTAMP       | NULLABLE                        |               |

**Unique Constraints**: `(reading_list_id, post_id)`

**Indexes**: `reading_list_id`

**Foreign Keys**:

- `reading_list_id` → `reading_lists(id)` ON DELETE CASCADE
- `post_id` → `posts(id)` ON DELETE CASCADE

---

### 14. notifications

Laravel's default notification table.

| Column          | Type            | Constraints | Description          |
| --------------- | --------------- | ----------- | -------------------- |
| id              | UUID            | PK          |                      |
| type            | VARCHAR(255)    | NOT NULL    | Notification class   |
| notifiable_type | VARCHAR(255)    | NOT NULL    | Model class          |
| notifiable_id   | BIGINT UNSIGNED | NOT NULL    | Model ID             |
| data            | JSON            | NOT NULL    | Notification payload |
| read_at         | TIMESTAMP       | NULLABLE    |                      |
| created_at      | TIMESTAMP       | NULLABLE    |                      |
| updated_at      | TIMESTAMP       | NULLABLE    |                      |

**Indexes**: `(notifiable_type, notifiable_id)`, `read_at`

---

### 15. notification_settings

User notification preferences.

| Column            | Type            | Constraints             | Description      |
| ----------------- | --------------- | ----------------------- | ---------------- |
| id                | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |                  |
| user_id           | BIGINT UNSIGNED | FK → users.id, NOT NULL |                  |
| notification_type | VARCHAR(100)    | NOT NULL                | Type identifier  |
| channels          | JSON            | DEFAULT '["database"]'  | Enabled channels |
| is_enabled        | BOOLEAN         | DEFAULT TRUE            | Master toggle    |
| created_at        | TIMESTAMP       | NULLABLE                |                  |
| updated_at        | TIMESTAMP       | NULLABLE                |                  |

**Unique Constraints**: `(user_id, notification_type)`

**Indexes**: `user_id`

**Foreign Keys**: `user_id` → `users(id)` ON DELETE CASCADE

**Notification Types**:

- `new_post` - New post from followed user/author
- `new_comment` - Comment on user's post
- `comment_reply` - Reply to user's comment
- `post_liked` - Someone liked user's post
- `post_bookmarked` - Someone bookmarked user's post
- `mention` - User mentioned in comment (@username)
- `system` - System announcements
- `moderation` - Content moderation updates

---

### 16. reports

Polymorphic content reporting.

| Column          | Type            | Constraints             | Description                                                       |
| --------------- | --------------- | ----------------------- | ----------------------------------------------------------------- |
| id              | BIGINT UNSIGNED | PK, AUTO_INCREMENT      |                                                                   |
| reporter_id     | BIGINT UNSIGNED | FK → users.id, NOT NULL |                                                                   |
| reportable_type | VARCHAR(255)    | NOT NULL                | Model class                                                       |
| reportable_id   | BIGINT UNSIGNED | NOT NULL                | Model ID                                                          |
| report_type     | ENUM            | NOT NULL                | spam, inappropriate, copyright, harassment, misinformation, other |
| reason          | TEXT            | NOT NULL                | User explanation                                                  |
| status          | ENUM            | DEFAULT 'pending'       | pending, reviewing, resolved, dismissed                           |
| admin_notes     | TEXT            | NULLABLE                | Admin response                                                    |
| resolved_by     | BIGINT UNSIGNED | FK → users.id, NULLABLE |                                                                   |
| resolved_at     | TIMESTAMP       | NULLABLE                |                                                                   |
| created_at      | TIMESTAMP       | NULLABLE                |                                                                   |
| updated_at      | TIMESTAMP       | NULLABLE                |                                                                   |

**Indexes**: `(reportable_type, reportable_id)`, `status`, `reporter_id`, `(status, created_at)`

**Foreign Keys**:

- `reporter_id` → `users(id)` ON DELETE CASCADE
- `resolved_by` → `users(id)` ON DELETE SET NULL

**Reportable Types**: `App\Models\Post`, `App\Models\Comment`, `App\Models\User`, `App\Models\Author`

---

### 17. contact_submissions

Contact form submissions.

| Column     | Type            | Constraints        | Description                  |
| ---------- | --------------- | ------------------ | ---------------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT |                              |
| name       | VARCHAR(255)    | NOT NULL           |                              |
| email      | VARCHAR(255)    | NOT NULL           |                              |
| subject    | VARCHAR(255)    | NOT NULL           |                              |
| message    | TEXT            | NOT NULL           |                              |
| status     | ENUM            | DEFAULT 'new'      | new, read, replied, archived |
| ip_address | VARCHAR(45)     | NULLABLE           |                              |
| user_agent | TEXT            | NULLABLE           |                              |
| created_at | TIMESTAMP       | NULLABLE           |                              |
| updated_at | TIMESTAMP       | NULLABLE           |                              |

**Indexes**: `status`, `created_at`

---

### 18. moderation_settings

Global moderation toggles.

| Column        | Type            | Constraints        | Description        |
| ------------- | --------------- | ------------------ | ------------------ |
| id            | BIGINT UNSIGNED | PK, AUTO_INCREMENT |                    |
| setting_key   | VARCHAR(100)    | UNIQUE, NOT NULL   | Setting identifier |
| setting_value | BOOLEAN         | DEFAULT FALSE      |                    |
| description   | TEXT            | NULLABLE           |                    |
| created_at    | TIMESTAMP       | NULLABLE           |                    |
| updated_at    | TIMESTAMP       | NULLABLE           |                    |

**Settings**:

- `posts_require_approval` - New posts need admin review
- `comments_require_approval` - New comments need approval
- `auto_approve_verified_users` - Skip approval for verified users

---

## Database Relationships Summary

### User

- `hasMany`: posts, comments, likes, bookmarks, reports, reading_lists, follows (as follower)
- `morphMany`: notifications
- `belongsToMany`: roles, permissions (Spatie)

### Post

- `belongsTo`: user, author, category, post_type, approved_by (user)
- `hasMany`: pages, comments, likes, bookmarks, views
- `morphMany`: reports, media

### PostPage

- `belongsTo`: post

### Comment

- `belongsTo`: post, user, parent (self)
- `hasMany`: replies (self)
- `morphMany`: reports

### Category

- `belongsTo`: parent (self)
- `hasMany`: children (self), posts
- `morphOne`: media

### Author

- `hasMany`: posts
- `morphMany`: follows, media

### Follow

- `belongsTo`: follower (User)
- `morphTo`: followable (User, Author)

### ReadingList

- `belongsTo`: user
- `hasMany`: items
- `belongsToMany`: posts (through items)

### Report

- `belongsTo`: reporter (User), resolved_by (User)
- `morphTo`: reportable

---

## Migration Order

1. `post_types` (no dependencies)
2. `authors` (no dependencies)
3. `categories` (self-referencing)
4. `users` modifications (add profile columns)
5. `posts` (depends on users, authors, categories, post_types)
6. `post_pages` (depends on posts)
7. `comments` (depends on posts, users, self)
8. `likes` (depends on users, posts)
9. `bookmarks` (depends on users, posts)
10. `views` (depends on posts, users)
11. `follows` (depends on users, polymorphic)
12. `reading_lists` (depends on users)
13. `reading_list_items` (depends on reading_lists, posts)
14. `notifications` (Laravel default)
15. `notification_settings` (depends on users)
16. `reports` (depends on users, polymorphic)
17. `contact_submissions` (no dependencies)
18. `moderation_settings` (no dependencies)

---

## Feature Flows

### Post Creation Flow

```
User creates post → status: draft
  ↓
User adds pages → post_pages with order: 10, 20, 30...
  ↓
User submits → status: pending (if moderation enabled)
  ↓
Admin approves → status: published, approved_at set
  ↓
Followers notified (where notify_new_posts = true)
```

### Multi-Page Display Flow

```
Load post → Query post_pages WHERE status = 'published' ORDER BY order
  ↓
Count pages → If > 1, show pagination
  ↓
Display page N → Calculate from sorted order position
```

### Notification Flow (Twitter-like)

```
User A follows User B (notify_new_posts = true)
  ↓
User B publishes post
  ↓
Query: SELECT * FROM follows WHERE followable = User:B AND notify_new_posts = true
  ↓
Fanout notifications to followers via preferred channels
```

### Mention Flow

```
User writes comment with @username
  ↓
Parse content for @mentions
  ↓
Create notification for each mentioned user (if mention notifications enabled)
```

---

**Next**: See [FEATURES.md](./FEATURES.md) for detailed feature specifications.
