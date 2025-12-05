# Sahittyacanvas Blogging System - Master Plan

## Project Overview

**Sahittyacanvas** is a comprehensive Bengali literature blogging platform designed to host various types of literary content including poetry, stories, multi-page novels, and works attributed to famous writers like Rabindranath Tagore.

## Current Status

### ✅ Already Implemented

- Laravel 12 with Inertia.js (React 19)
- User authentication (Laravel Fortify with 2FA)
- **All packages installed and configured**:
    - Spatie Laravel Permission (roles & permissions)
    - Spatie Media Library (file uploads)
    - Laravisit (visit tracking)
    - Laravel Adjacency List (nested comments & categories)
    - Spatie Laravel Sitemap (SEO sitemap)
    - Laravel SEO (meta tags, OpenGraph, JSON-LD)
    - Spatie Laravel Activitylog (audit trail)
- **Database migrations completed**:
    - post_types, authors, categories
    - users (profile columns), posts, post_pages
    - comments, likes, bookmarks
    - follows, reading_lists, reading_list_items
    - notifications, notification_settings
    - reports, contact_submissions, moderation_settings
    - activity_log (with event & batch_uuid)

### 🚧 Needs Implementation

- Eloquent Models with traits and relationships
- Controllers and API routes
- Frontend React components
- See detailed plans in respective documentation files.

## Documentation Structure

This plan is split into multiple focused documents:

1. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database design with all tables, relationships, and migrations
2. **[FEATURES.md](./FEATURES.md)** - Detailed feature specifications and requirements
3. **[IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md)** - Step-by-step implementation roadmap
4. **[NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md)** - Notification architecture with Laravel Broadcasting
5. **[MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)** - Spatie Media Library integration strategy
6. **[CONTENT_EDITOR.md](./CONTENT_EDITOR.md)** - Rich text editor and multi-page content strategy
7. **[REVIEW_MODERATION.md](./REVIEW_MODERATION.md)** - Content moderation and approval workflows

## Technology Stack

### Backend

- **Framework**: Laravel 12.39.0
- **PHP**: 8.4.14
- **Database**: MySQL
- **Authentication**: Laravel Fortify (with 2FA)
- **Permissions**: Spatie Laravel Permission ✅ - [GitHub](https://github.com/spatie/laravel-permission)
- **Media**: Spatie Media Library ✅ - [GitHub](https://github.com/spatie/laravel-medialibrary)
- **Visit Tracking**: Laravisit ✅ - [GitHub](https://github.com/coderflexx/laravisit)
- **Recursive Relations**: Laravel Adjacency List ✅ - [GitHub](https://github.com/staudenmeir/laravel-adjacency-list)
- **Sitemap**: Spatie Laravel Sitemap ✅ - [GitHub](https://github.com/spatie/laravel-sitemap)
- **SEO**: Laravel SEO ✅ - [GitHub](https://github.com/ralphjsmit/laravel-seo)
- **Activity Log**: Spatie Laravel Activitylog ✅ - [GitHub](https://github.com/spatie/laravel-activitylog)
- **Broadcasting**: Laravel Echo + Pusher/Soketi
- **Queue**: Redis/Database
- **Cache**: Redis

### Frontend

- **Framework**: React 19.2.0
- **Router**: Inertia.js 2.1.4
- **Styling**: TailwindCSS 4.1.12
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Rich Editor**: Novel.sh or Tiptap (MDX support)
- **Forms**: Inertia.js useForm / Form component (built-in)

## Core Features Summary

### 1. User Management

- Multi-role system (Admin, Moderator, Author, User)
- Profile management with avatar/banner
- User verification and reputation system

### 2. Role & Permissions

- Dynamic permission system using Spatie
- Role-based access control (RBAC)
- Custom permissions per feature

### 3. Notification System

- Real-time notifications via Laravel Broadcasting
- Multiple channels (database, broadcast, mail)
- User preference controls
- Notification types: posts, comments, likes, system alerts

### 4. Blog Management

- Multiple content types: Poetry, Story, Literature, Multi-page Novel
- Author attribution (user-written vs famous writer)
- **Multi-page post system** (see [POST_MULTIPAGE.md](./POST_MULTIPAGE.md)):
    - Page 1 content stored in `posts.content`
    - Additional pages in `post_pages` table with `order` field
    - Page navigation with actual page orders from database
    - Content validation before creating new pages
    - Race condition protection with `lockForUpdate()`
- Draft, pending, published, archived states
- Scheduled publishing with queue jobs (future)

### 5. Category Management

- Infinite nested categories
- Category images, descriptions, SEO
- Hierarchical navigation

### 6. Engagement Features

- **Views tracking via Laravisit**:
    - IP-based + user-based tracking
    - Popular posts by timeframe (today, week, month, year, all-time)
    - Unique visits with configurable intervals (hourly, daily, weekly, monthly)
    - Custom data tracking (region, referrer, etc.)
- Likes system
- Bookmarks/Reading lists
- **Nested comments via Laravel Adjacency List**:
    - Efficient recursive queries using CTEs (Common Table Expressions)
    - Get all ancestors, descendants, siblings in single query
    - Tree traversal without N+1 queries
    - Depth limiting for performance

### 7. Report System

- Report types: Author, Post, Comment, Website
- Contextual reporting (in-page report buttons)
- Admin moderation dashboard
- Report status tracking

### 8. Review/Moderation System

- Toggle-based approval for posts/comments
- Moderation queue
- Bulk actions
- Auto-approval rules

### 9. Static Pages Management

- About Us (already implemented)
- Terms & Conditions
- Privacy Policy
- Contact Page
- Dynamic page builder

### 10. Media Management

- Spatie Media Library integration
- Image optimization
- Multiple collections (avatars, banners, post images)
- CDN-ready

### 11. Activity Logging

- **Spatie Laravel Activitylog** for audit trails:
    - Track all model changes (create, update, delete)
    - Log user actions (login, logout, profile updates)
    - Admin actions logging (approvals, bans, content moderation)
    - Custom activity logging for business events
    - Store old/new values for change tracking
    - Causer tracking (who performed the action)

### 12. SEO & Sitemap

- **Spatie Laravel Sitemap** for SEO:
    - Auto-generate sitemap.xml
    - Include posts, categories, authors, static pages
    - Configurable change frequency and priority
    - Sitemap index for large sites
    - Scheduled regeneration via queue

## Development Principles

### Code Quality

- Follow PSR-12 coding standards
- Use Laravel best practices
- Type hints and strict types
- Comprehensive testing (Pest PHP)

### Performance

- Eager loading to prevent N+1 queries
- Redis caching for frequently accessed data
- Queue jobs for heavy operations
- Database indexing strategy

### Security

- CSRF protection
- XSS prevention
- SQL injection protection via Eloquent
- Rate limiting on APIs
- Content sanitization

### UX/UI

- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Fast page loads (<3s)
- Intuitive navigation
- Bengali language support

## Quick Start Guide

1. Review all documentation files in order
2. Start with Phase 1 from IMPLEMENTATION_PHASES.md
3. Follow database migrations from DATABASE_SCHEMA.md
4. Implement features according to FEATURES.md
5. Test each feature before moving to next phase

## Next Steps

1. ✅ Review this master plan
2. 📖 Read DATABASE_SCHEMA.md for database design
3. 📋 Review FEATURES.md for detailed requirements
4. 🚀 Follow IMPLEMENTATION_PHASES.md for execution

---

**Last Updated**: December 5, 2025  
**Version**: 1.2.0  
**Status**: Post Edit UI Complete
