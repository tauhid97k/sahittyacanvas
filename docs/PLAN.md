# Sahittyacanvas Blogging System - Master Plan

## Project Overview

**Sahittyacanvas** is a comprehensive Bengali literature blogging platform designed to host various types of literary content including poetry, stories, multi-page novels, and works attributed to famous writers like Rabindranath Tagore.

## Current Status

### ✅ Already Implemented

- Laravel 12 with Inertia.js (React 19)
- User authentication (Laravel Fortify with 2FA)
- Spatie Laravel Permission package installed
- Basic database schema with:
    - Users, Posts, Categories (nested), Comments (nested)
    - Bookmarks, Likes, Views
    - SEO metadata
    - About Us page management

### 🚧 Needs Implementation

See detailed plans in respective documentation files.

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
- **Permissions**: Spatie Laravel Permission
- **Media**: Spatie Media Library (to be installed)
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
- **Forms**: React Hook Form + Zod

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
- Rich text/MDX editor with multi-page support using order-based system:
    - **Order-based page management**: Uses `order` field instead of sequential page numbers
    - **Soft deletes**: Pages are soft deleted, maintaining stable references
    - **Dynamic page numbering**: Frontend calculates page numbers from sorted order
    - **Fractional ordering**: Insert pages between existing ones without cascading updates
    - **Background rebalancing**: Periodic cleanup of order gaps via queue jobs
- **Advanced multi-page authoring interface**:
    - **Page timeline navigation**: Horizontal timeline showing all chapters with current page indicator
    - **Click-to-navigate**: Click any timeline dot to jump between pages with auto-save
    - **Save & Add New Page**: Seamless workflow for continuous writing
    - **Visual page status indicators**: Draft (🔴), Ready (🟡), Published (✅), Announced (⏰)
    - **Drag-drop reordering**: Default feature for easy chapter organization
    - **Auto-save functionality**: Prevents data loss during page switching
    - **Keyboard shortcuts**: Ctrl+S (save), Ctrl+→/← (navigate), Ctrl+N (new page)
- **Two-level publishing system**:
    - **Page-level publishing**: Authors can publish individual chapters in any order
    - **Post-level validation**: Full post publishing requires sequential pages without gaps
    - **Smart publishing options**: Publish first N chapters, publish all ready, or publish entire post
    - **Gap detection**: Clear warnings about missing chapters before full publication
- **Announced status and reminder system**:
    - **Scheduled publishing**: Announce chapters with future release dates/times
    - **Reader reminders**: Users can set notifications for upcoming chapters
    - **Multi-channel notifications**: In-app push + email reminders (15 mins before + at publish)
    - **Countdown timers**: Real-time countdown displays for announced chapters
    - **Author analytics**: Track reminder counts, engagement metrics, and reader anticipation
    - **Conversion tracking**: Monitor reminder-to-read conversion rates
- **Preview modes**:
    - **Edit view**: Author interface with timeline and all management features
    - **Reader preview**: Shows exactly what readers will see with current page order
- Scheduled publishing with queue jobs
- Draft, pending, published states

### 5. Category Management

- Infinite nested categories
- Category images, descriptions, SEO
- Hierarchical navigation

### 6. Engagement Features

- Views tracking (IP-based + user-based)
- Likes system
- Bookmarks/Reading lists
- Nested comments with infinite replies
- Comment reactions

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

**Last Updated**: November 20, 2025  
**Version**: 1.0.0  
**Status**: Planning Phase
