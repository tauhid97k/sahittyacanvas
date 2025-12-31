# Sahittyacanvas - Master Plan

## Project Overview

**Sahittyacanvas** (সাহিত্য ক্যানভাস) is a comprehensive Bengali literature platform combining:

1. **Blogging System** - Poetry, stories, multi-page novels, works attributed to famous writers
2. **E-commerce Marketplace** - Products sold by sellers with cart, checkout, and order management

## Current Status

### ✅ Dashboard Complete

- **Backend Stack**: Laravel 12.39.0, PHP 8.4.16, PostgreSQL
- **Frontend Stack**: React 19, Inertia.js SSR, TypeScript, TailwindCSS 4, shadcn/ui
- **Authentication**: Laravel Fortify with 2FA
- **All packages installed and configured**:
    - Spatie Laravel Permission (roles & permissions)
    - Spatie Media Library (file uploads with conversions)
    - Laravisit (visit tracking for posts)
    - Laravel Adjacency List (nested comments & categories)
    - Spatie Laravel Sitemap (SEO sitemap)
    - Laravel SEO (meta tags, OpenGraph, JSON-LD, Article schema)
    - Spatie Laravel Activitylog (audit trail)

- **Database Complete**:
    - Users with profiles, roles, permissions
    - Blog: posts, post_pages, categories, authors, comments, likes, bookmarks
    - E-commerce: products, product_categories, orders, order_items, carts, cart_items, transactions, payment_methods, product_reviews
    - Platform: platform_settings, moderation_settings, notifications, reports, contact_submissions

- **Dashboard Features Complete**:
    - Posts CRUD with multi-page support
    - Categories & Authors management
    - Products CRUD with images, stock, pricing
    - Product Categories (nested)
    - Orders management (seller & buyer views)
    - Transactions tracking
    - User management with ban/unban
    - Roles & Permissions management
    - Moderation queue (posts, comments, products)
    - Activity logs
    - Notifications system
    - Platform settings (commission, rules, terms, privacy)
    - Payment methods configuration

### 🚧 In Progress: Public Pages

- See [PUBLIC_PAGES.md](./PUBLIC_PAGES.md) for detailed implementation plan
- Home page, blog pages, shop pages, cart, checkout
- SEO optimization with structured data

## Documentation Structure

This plan is split into multiple focused documents:

1. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database design (needs update for e-commerce tables)
2. **[FEATURES.md](./FEATURES.md)** - Detailed feature specifications
3. **[IMPLEMENTATION_PHASES.md](./IMPLEMENTATION_PHASES.md)** - Original implementation roadmap (dashboard phases complete)
4. **[PUBLIC_PAGES.md](./PUBLIC_PAGES.md)** - **NEW** Public pages implementation plan
5. **[NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md)** - Notification architecture
6. **[MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)** - Spatie Media Library integration
7. **[CONTENT_EDITOR.md](./CONTENT_EDITOR.md)** - Rich text editor (Tiptap) and multi-page content
8. **[REVIEW_MODERATION.md](./REVIEW_MODERATION.md)** - Content moderation workflows
9. **[POST_MULTIPAGE.md](./POST_MULTIPAGE.md)** - Multi-page post system details

## Technology Stack

### Backend

- **Framework**: Laravel 12.39.0
- **PHP**: 8.4.16
- **Database**: PostgreSQL
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
- **Router**: Inertia.js 2.x with SSR
- **Styling**: TailwindCSS 4.x
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Rich Editor**: Tiptap with custom extensions
- **Forms**: Inertia.js useForm hook
- **Font**: QuickSand
- **Theme**: Green primary (`oklch(0.6 0.13 163)`), Dark/Light mode

## Core Features Summary

### 1. User Management ✅

- Multi-role system (Super Admin, Admin, Moderator, Author, Seller, User)
- Profile management with avatar/banner
- User ban/unban functionality
- Role-based dashboard access

### 2. Role & Permissions ✅

- Dynamic permission system using Spatie
- Role-based access control (RBAC)
- Custom permissions per feature
- Role enum for type safety

### 3. Notification System ✅

- Database notifications with Inertia
- Commission change notifications for sellers
- Notification types: posts, comments, likes, system alerts, orders
- Mark as read/unread functionality

### 4. Blog Management ✅

- Multiple content types via categories
- Author attribution (user-written vs famous writer)
- **Multi-page post system** (see [POST_MULTIPAGE.md](./POST_MULTIPAGE.md))
- Draft, pending, published, archived states
- Moderation workflow with approval/rejection
- SEO integration with Laravel SEO package

### 5. Category Management ✅

- Infinite nested categories (blog & product)
- Category images, descriptions, SEO
- Hierarchical navigation with Laravel Adjacency List
- Separate tables: `categories` (blog), `product_categories` (shop)

### 6. Engagement Features ✅

- **Views tracking via Laravisit** for posts
- **Product views** via `views_count` column
- Likes system for posts
- Bookmarks for posts
- **Nested comments via Laravel Adjacency List**
- **Product reviews** with ratings

### 7. Report System ✅

- Polymorphic reports for any model
- Report types: spam, inappropriate, copyright, harassment, misinformation
- Admin moderation dashboard
- Report status tracking (pending, reviewing, resolved, dismissed)

### 8. Review/Moderation System ✅

- Toggle-based approval for posts/comments/products
- Unified moderation queue
- Moderation settings per content type
- Auto-approval for trusted users

### 9. Platform Settings ✅

- Platform commission percentage
- Seller rules, Author rules
- Terms of Service, Privacy Policy
- Configurable via admin dashboard

### 10. Media Management ✅

- Spatie Media Library integration
- Image conversions (thumb, medium, large)
- Collections: avatars, banners, featured images, product images
- WebP support

### 11. Activity Logging ✅

- Spatie Laravel Activitylog on all models
- Track create, update, delete operations
- Causer tracking (who performed the action)
- Activity log viewer in dashboard

### 12. E-commerce ✅

- Products with pricing (stored in paisa), stock, SKU
- Product categories (nested)
- Shopping cart system
- Checkout with shipping info
- Orders with status workflow
- Transactions tracking
- Payment methods configuration
- Product reviews with ratings
- Seller dashboard

### 13. SEO

- Laravel SEO package integration
- Dynamic SEO data on models
- Article schema for posts
- Product schema for products
- BreadcrumbList schema
- Sitemap generation (to be implemented)

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

1. ✅ Dashboard complete
2. 🚧 Implement public pages (see [PUBLIC_PAGES.md](./PUBLIC_PAGES.md))
3. 📋 Add permission-based visibility to dashboard (later)
4. 🚀 Payment gateway integration (future)

---

**Last Updated**: December 31, 2025  
**Version**: 2.0.0  
**Status**: Dashboard Complete, Public Pages In Progress
