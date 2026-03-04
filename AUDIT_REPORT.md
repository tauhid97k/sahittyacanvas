# SahittyaCanvas — Full Project Audit Report

## 1. Project Overview

**SahittyaCanvas** is a bilingual (Bengali/English) literary platform combining a **blog CMS** with an **ecommerce marketplace**. Built with Laravel 12 + Inertia.js 2 + React 19.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2, Inertia.js 2 |
| Auth | Laravel Fortify (2FA support) |
| Permissions | Spatie Laravel Permission |
| Media | Spatie Media Library (queued conversions) |
| Activity Log | Spatie Activity Log |
| SEO | ralphjsmit/laravel-seo |
| Page Views | coderflex/laravisit |
| Nested Trees | staudenmeir/laravel-adjacency-list (categories, comments) |
| Websockets | Laravel Reverb |
| Sitemap | Spatie Sitemap |
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | TailwindCSS 4, shadcn/ui (Radix primitives) |
| Charts | Recharts 3 |
| Tables | TanStack React Table |
| Editor | TipTap (rich text with image upload, tables, code blocks) |
| Icons | Lucide React |
| Toasts | Sonner |

---

## 2. Database Schema (33 migrations, 25 models)

### Core Platform
| Table | Purpose |
|-------|---------|
| `users` | Users with profile fields (username, bio, avatar, banner, reputation, ban) |
| `permission_tables` | Spatie roles, permissions, model_has_roles, etc. |
| `activity_log` | Spatie activity logging |
| `media` | Spatie media library |
| `editor_media` | Temp storage for TipTap editor uploads |
| `laravisits` | Polymorphic page view tracking |
| `seo` | Per-model SEO metadata |

### Blog CMS
| Table | Purpose |
|-------|---------|
| `authors` | Famous writers (not users) — bilingual names, bio, dates |
| `categories` | Hierarchical post categories (nested via parent_id) |
| `posts` | Blog posts with status (draft/published/archived), moderation (auto/pending/approved/rejected), multi-page support |
| `post_pages` | Additional pages for multi-page posts |
| `category_post` | Many-to-many pivot |
| `comments` | Nested comments (adjacency list), moderation support |
| `likes` | Post likes (user_id + post_id) |
| `bookmarks` | Post bookmarks |
| `follows` | Polymorphic follows (users ↔ users, users ↔ authors) |
| `notifications` | Laravel notifications |
| `reports` | Polymorphic content reports |
| `contact_submissions` | Contact form entries |
| `moderation_settings` | Key-value settings for moderation toggles |

### Ecommerce
| Table | Purpose |
|-------|---------|
| `product_categories` | Hierarchical product categories |
| `products` | Seller products with pricing (paisa), stock, discounts, moderation |
| `category_product` | Many-to-many pivot |
| `product_reviews` | Verified purchase reviews (1-5 stars) |
| `carts` / `cart_items` | Guest + authenticated carts |
| `orders` / `order_items` | Multi-seller orders with full shipping/fulfillment |
| `payment_methods` | Configurable payment methods (bKash, Nagad, COD, etc.) |
| `transactions` | Polymorphic transactions linked to orders |

---

## 3. Roles & Permissions

### 7 Roles
| Role | Description |
|------|-------------|
| **SUPER** | God mode — all permissions via Gate::before bypass |
| **ADMIN** | Full access except platform settings |
| **USER** | Basic — dashboard + own orders |
| **AUTHOR** | Blog posts CRUD + categories/authors (read) + comments (read) |
| **EDITOR** | Full blog management (categories, authors, posts) |
| **MODERATOR** | Approve/reject posts, comments, products |
| **SELLER** | Products CRUD + orders management + transactions |

### Permission Groups (57 total permissions)
- DASHBOARD (1): VIEW_DASHBOARD
- USER (6): LIST, VIEW, CREATE, EDIT, DELETE, BAN
- ROLE (6): LIST, VIEW, CREATE, EDIT, DELETE, MANAGE_PERMISSIONS
- CATEGORY (4): LIST, CREATE, EDIT, DELETE
- AUTHOR (4): LIST, CREATE, EDIT, DELETE
- POST (7): LIST, VIEW, CREATE, EDIT, DELETE, RESTORE, FORCE_DELETE
- COMMENT (4): LIST, APPROVE, REJECT, DELETE
- MODERATION (4): LIST, APPROVE_POST, REJECT_POST, MANAGE_SETTINGS
- PRODUCT_CATEGORY (4): LIST, CREATE, EDIT, DELETE
- PRODUCT (7): LIST, VIEW, CREATE, EDIT, DELETE, APPROVE, REJECT
- PRODUCT_REVIEW (2): LIST, DELETE
- ORDER (5): LIST, VIEW, UPDATE_STATUS, CANCEL, MARK_PAID
- TRANSACTION (4): LIST, VIEW, MARK_PAID, REFUND
- PAYMENT_METHOD (4): LIST, CREATE, EDIT, DELETE
- PLATFORM_SETTINGS (2): LIST, EDIT
- ACTIVITY (2): LIST, VIEW

---

## 4. Existing Dashboard Components

### Stats Cards (4 components)
| Component | Data | Visible To |
|-----------|------|------------|
| `PlatformStats` | Total users, posts, products, orders + new users today/week | SUPER, ADMIN |
| `BlogStats` | Total/published/draft posts, views (stubbed to 0), comments | SUPER, ADMIN, AUTHOR |
| `EcommerceStats` | Products, orders, pending orders, revenue (today/week/month/total) | SUPER, ADMIN, SELLER |
| `ModerationStats` | Pending posts, comments, products counts | SUPER, ADMIN, MODERATOR |

### Charts (3 components)
| Component | Type | Data | Visible To |
|-----------|------|------|------------|
| `RevenueChart` | Area chart (30 days) | Revenue per day from paid transactions | SUPER, ADMIN, SELLER |
| `OrdersChart` | Bar chart | Orders grouped by status | SUPER, ADMIN, SELLER |
| `PostViewsChart` | Area chart (30 days) | Posts published per day (NOT actual views) | SUPER, ADMIN, AUTHOR |

### Recent Activity Tables (3 components)
| Component | Data | Visible To |
|-----------|------|------------|
| `RecentOrders` | Last 5 orders with customer, total, status, payment | SUPER, ADMIN, SELLER |
| `RecentPosts` | Last 5 posts with author, status, views (stubbed to 0) | SUPER, ADMIN, AUTHOR |
| `RecentReviews` | Last 5 reviews with rating, user, product | SUPER, ADMIN, SELLER |

### Reusable Table Component
- `DataTable` at `resources/js/components/ui/data-table.tsx` — TanStack Table wrapper with row selection, manual pagination

---

## 5. Bugs & Issues Found

### 🔴 Critical Issues

#### 5.1 Missing Route: "Following" page
**Sidebar** has a "Following" menu item pointing to `/dashboard/following`, but **no route, controller, or page exists**. Clicking it will 404.
- **File**: `resources/js/components/app-sidebar.tsx` line 131
- **Fix**: Create a FollowController + route + page, or remove the menu item

#### 5.2 Ecommerce Stats: `activeProducts` uses wrong status value
`DashboardController::getEcommerceStats()` line 144 queries `->where('status', 'active')` but the Product model only has statuses: `draft`, `published`, `archived`. This will always return 0.
- **File**: `app/Http/Controllers/DashboardController.php` line 144
- **Fix**: Change `'active'` to `'published'`

#### 5.3 Blog Stats: `totalViews` hardcoded to 0
`DashboardController::getBlogStats()` line 119 sets `$totalViews = 0` with comment "Views tracked by Laravisit package" but never actually queries Laravisit.
- **File**: `app/Http/Controllers/DashboardController.php` line 119
- **Fix**: Use `Post::withTotalVisitCount()` to get actual view data

#### 5.4 PostViewsChart shows posts-per-day, NOT views
The chart component is named "Post Views" but `getPostViewsChartData()` returns `COUNT(*)` of posts created per day, not actual page views.
- **File**: `app/Http/Controllers/DashboardController.php` lines 241-270
- **Fix**: Either rename to "Posts Published" or integrate Laravisit data

### 🟡 Permission & Access Issues

#### 5.5 ProductController::show() blocks admin/super from viewing products
The `show()` method checks `$product->user_id !== $request->user()->id` and aborts 403, meaning even SUPER/ADMIN cannot view any seller's product detail page. Same issue in `edit()` and `destroy()`.
- **File**: `app/Http/Controllers/ProductController.php` lines 229-231, 276-278, 429-431
- **Fix**: Add `$canViewAll` bypass like PostController does

#### 5.6 OrderController::show() blocks admin/super from viewing orders
Same pattern — seller order detail checks `$order->seller_id !== $request->user()->id` without super/admin bypass.
- **File**: `app/Http/Controllers/OrderController.php` lines 174-175
- **Fix**: Add super/admin bypass

#### 5.7 TransactionController blocks admin/super from viewing transactions
`index()` always filters by `payee_id = $user->id`, `show()` checks ownership. Admin/Super cannot see all transactions.
- **File**: `app/Http/Controllers/TransactionController.php` lines 38, 117-118
- **Fix**: Add super/admin bypass with scope filtering

#### 5.8 USER role has CANCEL_ORDER permission missing
The USER role seeder gives `LIST_ORDER` but not `CANCEL_ORDER`. The buyer cancel route checks for `CANCEL_ORDER` permission, so regular users cannot cancel their own orders.
- **File**: `database/seeders/RolesPermissionsSeeder.php` line 225-228
- **Fix**: Add `CANCEL_ORDER` and `VIEW_ORDER` to USER role

#### 5.9 EDITOR role not recognized in DashboardController
DashboardController checks `isSuper`, `isAdmin`, `isSeller`, `isAuthor`, `isModerator` but never `isEditor`. Editors get no dashboard stats/charts despite having full blog permissions.
- **File**: `app/Http/Controllers/DashboardController.php`
- **Fix**: Add `$isEditor` check alongside `$isAuthor` for blog stats/charts

### 🟠 Redundant/Missing Menu Items

#### 5.10 PaymentMethod has no sidebar menu entry
`PaymentMethodController` exists with full CRUD + `LIST_PAYMENT_METHOD` permission, but no sidebar menu item. Only accessible by URL.
- **Fix**: Add payment methods sidebar item gated by `LIST_PAYMENT_METHOD`

#### 5.11 Sidebar "Orders" link always visible but route is seller-only
Sidebar shows "Orders" for all users pointing to `/dashboard/orders`, but the `sellerIndex` route is seller-scoped. Regular users should be directed to `/my-orders` instead.
- **File**: `resources/js/components/app-sidebar.tsx` lines 193-198

---

## 6. Dashboard Enhancement Plan

### 6.1 What Each Role Should See

#### SUPER ADMIN / ADMIN Dashboard
**Current**: ✅ Platform stats, blog stats, ecommerce stats, moderation queue, revenue chart, orders chart, post views chart, recent orders, recent posts, recent reviews
**Missing/Needs Fix**:
- Fix `activeProducts` count (use `published` not `active`)
- Fix `totalViews` (integrate Laravisit)
- Add: Total revenue today/week/month summary cards
- Add: User growth chart (new registrations over 30 days)
- Add: Top selling products table
- Add: Low stock products alert
- Add: Platform commission stats (if applicable)
- Add: Contact submissions count

#### SELLER Dashboard
**Current**: ✅ Ecommerce stats, revenue chart, orders chart, recent orders, recent reviews
**Missing/Needs Fix**:
- Fix `activeProducts` count
- Add: Stock alerts (low stock / out of stock products)
- Add: Top selling products list
- Add: Average order value
- Add: Conversion rate (views → orders)
- Add: Revenue trend comparison (this month vs last month)
- Add: Pending payment summary

#### AUTHOR Dashboard
**Current**: ✅ Blog stats, post views chart, recent posts
**Missing/Needs Fix**:
- Fix `totalViews` (integrate Laravisit)
- Fix "Post Views" chart to show actual views
- Add: Top performing posts (by views/likes/comments)
- Add: Follower growth chart
- Add: Comment engagement stats
- Add: Bookmark/like trends

#### USER Dashboard
**Current**: ❌ **Completely empty** — no stats, charts, or tables shown
**Recommended**:
- Add: My orders summary (total, pending, delivered)
- Add: Recent orders list
- Add: Wishlist count
- Add: Bookmarks count
- Add: Reading stats (posts read, comments made)
- Add: Following count

#### MODERATOR Dashboard
**Current**: ✅ Moderation queue stats
**Recommended**:
- Add: Moderation activity stats (approved/rejected today/week)
- Add: Pending queue trend chart
- Add: Recent moderation actions log

#### EDITOR Dashboard
**Current**: ❌ No editor-specific content (falls through to author if dual-role)
**Fix**: Treat EDITOR same as AUTHOR for blog stats/charts, plus add:
- Category management stats
- Author management stats

### 6.2 Suggested New Dashboard Components

| Component | Type | For Roles |
|-----------|------|-----------|
| `UserGrowthChart` | Line chart (30 days) | SUPER, ADMIN |
| `TopProducts` | Table (top 5 by sales) | SUPER, ADMIN, SELLER |
| `LowStockAlerts` | Alert cards | SUPER, ADMIN, SELLER |
| `UserOrderStats` | Stats cards | USER |
| `UserRecentOrders` | Table (last 5) | USER |
| `TopPosts` | Table (top 5 by views/likes) | SUPER, ADMIN, AUTHOR |
| `FollowerGrowthChart` | Line chart | AUTHOR |
| `ModerationActivityChart` | Bar chart | SUPER, ADMIN, MODERATOR |

---

## 7. Additional Findings

### 7.1 Architecture Quality ✅
- Clean MVC with Inertia.js SPA pattern
- Consistent permission checks in all controllers
- Good use of model scopes (published, visible, pendingModeration, etc.)
- Proper price handling (stored in paisa, displayed in taka)
- Bilingual support throughout
- Activity logging on all major models
- Media conversions with thumb/medium/large variants

### 7.2 Missing Features
1. **No wishlist migration** — `Wishlist` model exists but no migration file found in the standard location
2. **No review submission route** — `ProductReviewController` only has index + destroy, no `store` for buyers to submit reviews
3. **No follow/unfollow API** — Follow model exists but no controller for following/unfollowing from dashboard
4. **No search functionality** on public pages (only dashboard search)
5. **No payment gateway integration** — payment_methods table has config column but no actual gateway processing
6. **No email notifications for orders** — only post published notifications exist

### 7.3 Code Patterns to Watch
- `PostController::forceDelete` does NOT check FORCE_DELETE_POST permission (line 447)
- `ProductController::index` checks `canViewAll` against SUPER only (not ADMIN), but PostController checks both SUPER and ADMIN — inconsistency
- Guest checkout creates user + logs them in during transaction — potential race condition if email taken between validation and creation

---

## 8. Summary of Action Items

### Immediate Fixes (Bugs)
1. Fix `activeProducts` status query: `'active'` → `'published'`
2. Fix `totalViews` in BlogStats: integrate Laravisit
3. Fix PostViewsChart: show actual views or rename
4. Add CANCEL_ORDER + VIEW_ORDER to USER role seeder
5. Add admin/super bypass in ProductController show/edit/destroy
6. Add admin/super bypass in OrderController show
7. Add admin/super bypass in TransactionController index/show
8. Add EDITOR role handling in DashboardController
9. Remove or implement "Following" sidebar menu item
10. Add `forceDelete` permission check in PostController

### Dashboard Enhancements
11. Implement USER dashboard (order stats, recent orders, wishlist/bookmark counts)
12. Add user growth chart for SUPER/ADMIN
13. Add top products + low stock alerts for SELLER
14. Add top posts + follower stats for AUTHOR
15. Add moderation activity chart for MODERATOR
16. Add PaymentMethod sidebar menu item

### Future Features
17. Implement review submission for buyers
18. Implement follow/unfollow from dashboard
19. Public search functionality
20. Payment gateway integration
21. Order email notifications
