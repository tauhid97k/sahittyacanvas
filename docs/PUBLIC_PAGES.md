# Public Pages Implementation Guide

## Overview

This document outlines the complete implementation plan for the public-facing pages of Sahitya Canvas. The platform combines a Bengali literature blogging system with an e-commerce marketplace, requiring a unified design that supports both content types.

**Key Principles:**

- Inertia.js SSR with React + TypeScript
- Green primary branding (`oklch(0.6 0.13 163)`)
- Dark/Light mode support (already configured)
- Bengali-first UI with English fallbacks
- SEO-optimized from day one
- Mobile-responsive design

---

## Phase 1: Layout & Navigation

### 1.1 Public Layout (`resources/js/layouts/PublicLayout.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐
│                         PublicHeader                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         {children}                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                         PublicFooter                            │
└─────────────────────────────────────────────────────────────────┘
```

**Components to create:**

- `PublicLayout.tsx` - Main wrapper
- `PublicHeader.tsx` - Navigation header
- `PublicFooter.tsx` - Footer with links
- `MobileMenu.tsx` - Responsive mobile navigation

### 1.2 Header Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  হোম  লেখালেখি▼  খ্যাতিমান কবি/লেখক  কেনাকাটা করুন▼  আমাদের সম্পর্কে │ [🔍] [🛒] [লগইন] [নিবন্ধন] [🌙]
└─────────────────────────────────────────────────────────────────────────────┘
```

**Menu Structure:**

| Menu Item      | Bengali            | Route      | Type                          |
| -------------- | ------------------ | ---------- | ----------------------------- |
| Home           | হোম                | `/`        | Link                          |
| Writings       | লেখালেখি           | -          | Dropdown (Blog Categories)    |
| Famous Writers | খ্যাতিমান কবি/লেখক | `/authors` | Link                          |
| Shop           | কেনাকাটা করুন      | -          | Dropdown (Product Categories) |
| About Us       | আমাদের সম্পর্কে    | `/about`   | Link                          |

**লেখালেখি Dropdown (Blog Categories):**

- Uses `staudenmeir/laravel-adjacency-list` for nested categories
- Renders hierarchical menu with children
- Example structure:
    ```
    কবিতা (Poetry)
    ├── আধুনিক কবিতা
    ├── ক্লাসিক্যাল কবিতা
    └── ছন্দবদ্ধ কবিতা
    উপন্যাস (Novel)
    ছড়া (Rhyme)
    গল্প (Story)
    ভ্রমণকাহিনী (Travel)
    আত্মজীবনী (Autobiography)
    ```

**কেনাকাটা করুন Dropdown (Product Categories):**

- Same nested structure as blog categories
- Uses `ProductCategory` model with `HasRecursiveRelationships`

**Right Side Actions:**

- Search icon (expandable search bar)
- Cart icon with badge (item count) → `/cart`
- Login/Register buttons OR User dropdown (if authenticated)
- Theme toggle (dark/light mode)

### 1.3 Footer Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                                    [Social Icons]   │
│  সাহিত্য ক্যানভাস                                          [FB] [X] [IG]    │
│                                                                             │
│  একটি মুক্ত, সৃজনশীল ও অনুপ্রেরণাদায়ক প্ল্যাটফর্ম যেখানে বাংলা                │
│  আমার কবিতা, গল্প, প্রবন্ধ ও অন্যান্য সাহিত্যকর্ম জীবিত হয়ে ওঠে...           │
├─────────────────────────────────────────────────────────────────────────────┤
│  গুরুত্বপূর্ণ লিংকস        গুরুত্বপূর্ণ লিংকস        গুরুত্বপূর্ণ লিংকস      │
│  ──────────────           ──────────────           ──────────────          │
│  আমাদের সম্পর্কে           কবিতা                    আবৃত্তি                 │
│  ব্লগ                      গল্প                     পাঠচক্র                 │
│  যোগাযোগ                   প্রবন্ধ                   খ্যাতিমান কবি/লেখক      │
│  প্রশ্ন ও উত্তর             New অন্যান্য              অন্যান্য                │
├─────────────────────────────────────────────────────────────────────────────┤
│  📞 01717-171717    ✉️ support@sahityacanvas.com                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  © Sahitya Canvas All Rights Reserved.    নীতিমালা ও শর্তাবলী | গোপনীয়তা নীতি │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Home Page

### 2.1 Route: `/`

### 2.2 Sections

#### Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  [Beautiful nature/literary background image]                   │
│                                                                 │
│        সাহিত্য, কবিতা ও আবৃত্তির অনন্য ভুবন                      │
│  বাংলার কবি ও পাঠকের জন্য এক অনন্য প্ল্যাটফর্ম...                │
│                                                                 │
│  [🔍 Search Bar: খুঁজুন কবিতা, গল্প, লেখক...]                    │
│                                                                 │
│  [Category Pills: কবিতা | গল্প | উপন্যাস | প্রবন্ধ | ছড়া]        │
└─────────────────────────────────────────────────────────────────┘
```

#### Recent Posts Section

```
সাম্প্রতিক লেখা
সদ্য প্রকাশিত সাহিত্যকর্মের সংগ্রহ

[Post Card] [Post Card] [Post Card] [Post Card]
[Post Card] [Post Card] [Post Card] [Post Card]

                    [আরও দেখুন →]
```

#### Popular Products Section (NEW)

```
জনপ্রিয় পণ্য 🛍️
আমাদের সেরা বিক্রিত পণ্যসমূহ

[Product Card] [Product Card] [Product Card] [Product Card]

                    [সব পণ্য দেখুন →]
```

#### Famous Writers Section

```
খ্যাতিমান লেখক
আমাদের সৃজনশীল লেখকদের সাথে পরিচিত হন

[Avatar+Name] [Avatar+Name] [Avatar+Name] [Avatar+Name] [Avatar+Name] [Avatar+Name]
```

#### Categories Section

```
বিভাগ অনুযায়ী
আপনার পছন্দের বিভাগে লেখা খুঁজুন

[Category Card: কবিতা]  [Category Card: গল্প]  [Category Card: উপন্যাস]
[Category Card: প্রবন্ধ] [Category Card: ছড়া]  [Category Card: ভ্রমণকাহিনী]
```

### 2.3 Components

| Component           | Purpose                                |
| ------------------- | -------------------------------------- |
| `HeroSection.tsx`   | Hero with search and category pills    |
| `SearchBar.tsx`     | Expandable search input                |
| `CategoryPills.tsx` | Horizontal scrollable category buttons |
| `PostCard.tsx`      | Blog post preview card                 |
| `PostGrid.tsx`      | Grid layout for posts                  |
| `ProductCard.tsx`   | Product preview card                   |
| `ProductGrid.tsx`   | Grid layout for products               |
| `AuthorAvatar.tsx`  | Circular author avatar with name       |
| `CategoryCard.tsx`  | Category with image and count          |
| `SectionHeader.tsx` | Section title with optional link       |

---

## Phase 3: Blog Pages

### 3.1 Posts Listing (`/posts`, `/category/{slug}`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কবিতা]                                      │
├─────────────────────────────────────────────────────────────────┤
│  কবিতা                                                          │
│  শিল্পতোষ ছড়া ও নাট্যশালার সংগ্রহ                   [Sort: সর্বশেষ ▼] │
├─────────────────────────────────────────────────────────────────┤
│  [মোট পোস্ট: 42] [এই সপ্তাহে: 5] [মোট পাঠক: 1.2K] [লেখক: 12]    │
├─────────────────────────────────────────────────────────────────┤
│  [Post Card] [Post Card] [Post Card]                            │
│  [Post Card] [Post Card] [Post Card]                            │
│  [Post Card] [Post Card] [Post Card]                            │
├─────────────────────────────────────────────────────────────────┤
│                    [Pagination: ← 1 2 3 4 5 →]                  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Breadcrumb navigation (reuse dashboard component)
- Stats cards (total posts, this week, total views, authors)
- Sort options (সর্বশেষ, জনপ্রিয়, সর্বাধিক পঠিত)
- Pagination
- SEO meta tags via `getDynamicSEOData()`

### 3.2 Single Post (`/post/{slug}`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কবিতা > পোস্ট শিরোনাম]                       │
├─────────────────────────────────────────────────────────────────┤
│  [Featured Image - Full Width]                                  │
├─────────────────────────────────────────────────────────────────┤
│  পোস্ট শিরোনাম                                                   │
│  [Avatar] লেখক নাম • ১২ ডিসেম্বর ২০২৫ • 👁️ 1.2K • ❤️ 42        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Post Content - Rich HTML]                                     │
│                                                                 │
│  [Multi-page Navigation: ← পূর্ববর্তী | পৃষ্ঠা ১ ২ ৩ ৪ | পরবর্তী →] │
├─────────────────────────────────────────────────────────────────┤
│  [❤️ পছন্দ] [🔖 সংরক্ষণ] [📤 শেয়ার]                              │
├─────────────────────────────────────────────────────────────────┤
│  মন্তব্য (24)                                                    │
│  ────────────                                                   │
│  [Comment Form]                                                 │
│  [Comment Thread]                                               │
├─────────────────────────────────────────────────────────────────┤
│  সম্পর্কিত লেখা                                                  │
│  [Related Post] [Related Post] [Related Post]                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Multi-page support (existing `post_pages` system)
- Like, Bookmark, Share actions
- Nested comments with replies
- Related posts by category
- View tracking via Laravisit
- SEO with Article schema markup

### 3.3 Authors Listing (`/authors`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > খ্যাতিমান কবি/লেখক]                          │
├─────────────────────────────────────────────────────────────────┤
│  খ্যাতিমান কবি ও লেখক                              [Sort: সর্বশেষ ▼] │
│  আমাদের সৃজনশীল লেখকদের সাথে পরিচিত হন                          │
├─────────────────────────────────────────────────────────────────┤
│  [মোট লেখক: 8] [সক্রিয়: 3] [মোট লেখা: 12] [মোট পাঠক: 854]       │
├─────────────────────────────────────────────────────────────────┤
│  জনপ্রিয় লেখক                                                   │
│  [Featured Author Card] [Featured Author Card] [Featured]       │
├─────────────────────────────────────────────────────────────────┤
│  সব লেখক                                                        │
│  [Author Row] [Author Row] [Author Row] [Author Row]            │
│  [Pagination]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Author Profile (`/author/{slug}`)

**IMPORTANT: Hybrid design for blog + e-commerce**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > খ্যাতিমান কবি/লেখক > লেখক নাম]               │
├─────────────────────────────────────────────────────────────────┤
│  [Banner Image]                                                 │
│  [Avatar] লেখক নাম                                              │
│  জীবনী সংক্ষেপ...                                                │
│  [📝 লেখা: 12] [🛍️ পণ্য: 5] [👥 অনুসরণকারী: 145] [👁️ পাঠক: 854]  │
│  [অনুসরণ করুন]                                                   │
├─────────────────────────────────────────────────────────────────┤
│  [Tabs: লেখাসমূহ | পণ্যসমূহ | সম্পর্কে]                           │
├─────────────────────────────────────────────────────────────────┤
│  লেখাসমূহ Tab:                                                   │
│  [Post Card] [Post Card] [Post Card]                            │
│                                                                 │
│  পণ্যসমূহ Tab: (if seller)                                       │
│  [Product Card] [Product Card] [Product Card]                   │
│                                                                 │
│  সম্পর্কে Tab:                                                   │
│  [Full Biography, Birth/Death dates, Nationality]               │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**

- Show both posts AND products if author is also a seller
- Stats include both post count and product count
- Tabs for easy navigation between content types
- Follow button for notifications

---

## Phase 4: E-commerce Pages

### 4.1 Shop Page (`/shop`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কেনাকাটা করুন]                               │
├─────────────────────────────────────────────────────────────────┤
│  কেনাকাটা করুন                                                   │
├────────────────┬────────────────────────────────────────────────┤
│  ফিল্টার        │  [Sort: জনপ্রিয় ▼] [Grid/List Toggle]          │
│  ─────────     │  ────────────────────────────────────────────  │
│  বিভাগ         │  [Product] [Product] [Product] [Product]       │
│  ☐ বই         │  [Product] [Product] [Product] [Product]       │
│  ☐ স্টেশনারি   │  [Product] [Product] [Product] [Product]       │
│  ☐ গিফট       │                                                │
│  ─────────     │  [Pagination]                                  │
│  মূল্য পরিসীমা  │                                                │
│  [Min] - [Max] │                                                │
│  ─────────     │                                                │
│  রেটিং         │                                                │
│  ⭐⭐⭐⭐⭐ & up │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

**Features:**

- Sidebar filters (categories, price range, rating)
- Nested product categories (same as blog)
- Sort options (জনপ্রিয়, মূল্য: কম-বেশি, মূল্য: বেশি-কম, নতুন)
- Grid/List view toggle
- Pagination

### 4.2 Product Detail (`/product/{slug}`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কেনাকাটা > বই > পণ্যের নাম]                   │
├─────────────────────────────────────────────────────────────────┤
│  [Image Gallery]      │  পণ্যের নাম                              │
│  [Thumb] [Thumb]      │  ৳999 ৳1299 (23% ছাড়)                   │
│                       │  ⭐⭐⭐⭐⭐ (24 রিভিউ)                      │
│                       │  ✅ স্টকে আছে                            │
│                       │  ─────────────────                      │
│                       │  পরিমাণ: [- 1 +]                         │
│                       │  [🛒 কার্টে যোগ করুন] [⚡ এখনই কিনুন]      │
│                       │  ─────────────────                      │
│                       │  বিক্রেতা: [Seller Name]                  │
├─────────────────────────────────────────────────────────────────┤
│  [Tabs: বিবরণ | রিভিউ (24)]                                      │
├─────────────────────────────────────────────────────────────────┤
│  বিবরণ Tab:                                                      │
│  [Product Description - Rich HTML]                              │
│                                                                 │
│  রিভিউ Tab:                                                      │
│  [Review Form] (if purchased)                                   │
│  [Review List with ratings]                                     │
├─────────────────────────────────────────────────────────────────┤
│  সম্পর্কিত পণ্য                                                  │
│  [Product] [Product] [Product] [Product]                        │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Image gallery with thumbnails
- Price with discount display
- Stock status
- Quantity selector
- Add to cart / Buy now buttons
- Seller info with link to profile
- Product reviews with ratings
- Related products

### 4.3 Cart Page (`/cart`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কার্ট]                                       │
├─────────────────────────────────────────────────────────────────┤
│  আপনার কার্ট (3 items)                                           │
├─────────────────────────────────────────────────────────────────┤
│  [Image] পণ্যের নাম           ৳999    [- 2 +]    ৳1998    [✕]   │
│  [Image] পণ্যের নাম           ৳599    [- 1 +]    ৳599     [✕]   │
│  [Image] পণ্যের নাম           ৳299    [- 3 +]    ৳897     [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                    │  সাবটোটাল: ৳3,494          │
│                                    │  শিপিং: ৳60                │
│                                    │  ─────────────             │
│                                    │  মোট: ৳3,554               │
│                                    │  [চেকআউট করুন →]            │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Cart items with quantity controls
- Remove item button
- Price calculations
- Proceed to checkout button
- Empty cart state

### 4.4 Checkout Page (`/checkout`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > কার্ট > চেকআউট]                              │
├─────────────────────────────────────────────────────────────────┤
│  চেকআউট                                                         │
├─────────────────────────────┬───────────────────────────────────┤
│  শিপিং তথ্য                  │  অর্ডার সারাংশ                     │
│  ─────────────              │  ──────────────                   │
│  নাম *                      │  [Item] x2         ৳1,998         │
│  [Input]                    │  [Item] x1         ৳599           │
│  ফোন নম্বর *                 │  [Item] x3         ৳897           │
│  [Input]                    │  ─────────────────                │
│  ইমেইল                      │  সাবটোটাল:         ৳3,494         │
│  [Input]                    │  শিপিং:            ৳60            │
│  ঠিকানা *                   │  ─────────────────                │
│  [Textarea]                 │  মোট:              ৳3,554         │
│  শহর * [Dropdown]           │                                   │
│  এলাকা [Input]              │                                   │
│  পোস্টাল কোড [Input]         │                                   │
│  ─────────────              │                                   │
│  পেমেন্ট পদ্ধতি               │                                   │
│  ○ bKash                    │                                   │
│  ○ Nagad                    │                                   │
│  ○ ক্যাশ অন ডেলিভারি         │                                   │
│  ─────────────              │                                   │
│  নোট (ঐচ্ছিক)               │                                   │
│  [Textarea]                 │                                   │
│  ─────────────              │                                   │
│  [অর্ডার সম্পন্ন করুন]        │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

**Features:**

- Shipping information form
- Payment method selection
- Order summary
- Form validation
- Order confirmation

---

## Phase 5: Static Pages

### 5.1 About Us (`/about`)

**IMPORTANT: Preserve content from old design**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Hero: সাহিত্য ক্যানভাস - কবিতা, গল্প, সাহিত্য]                  │
├─────────────────────────────────────────────────────────────────┤
│  ভিশন ও মিশন                                     [Sidebar]      │
│  ─────────────                                   ─────────      │
│  আমাদের লক্ষ্য                                    দ্রুত লিংক     │
│  [Vision content from old design]                যোগাযোগ       │
│                                                  ফোন: ...      │
│  আমাদের উদ্দেশ্য ও পরিকল্পনা                       ইমেইল: ...    │
│  [Mission content from old design]                             │
│                                                                │
│  আমাদের প্রতিশ্রুতি                                              │
│  [Promise content from old design]                             │
├─────────────────────────────────────────────────────────────────┤
│  সম্পাদনা টিম                                                    │
│  [Team Member] [Team Member] [Team Member]                      │
│  [Team Member] [Team Member] [Team Member]                      │
├─────────────────────────────────────────────────────────────────┤
│  প্রধান স্পনসর                                                   │
│  [Sponsor Logo] [Sponsor Logo] [Sponsor Logo]                   │
├─────────────────────────────────────────────────────────────────┤
│  সংবাদ পরিষদ                                                    │
│  [News/Updates section]                                         │
├─────────────────────────────────────────────────────────────────┤
│  [CTA: আমাদের বিষয়ে - Join/Contact section]                     │
└─────────────────────────────────────────────────────────────────┘
```

**Sections to preserve from old design:**

1. Hero with site name and tagline
2. ভিশন ও মিশন (Vision & Mission)
3. সম্পাদনা টিম (Editorial Team)
4. প্রধান স্পনসর (Main Sponsors)
5. সংবাদ পরিষদ (News Section)
6. Contact sidebar

### 5.2 Contact (`/contact`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Breadcrumb: হোম > যোগাযোগ]                                     │
├─────────────────────────────────────────────────────────────────┤
│  যোগাযোগ করুন                                                    │
├─────────────────────────────┬───────────────────────────────────┤
│  [Contact Form]             │  যোগাযোগের তথ্য                    │
│  নাম *                      │  ─────────────                    │
│  [Input]                    │  📞 01717-171717                  │
│  ইমেইল *                    │  ✉️ support@sahityacanvas.com     │
│  [Input]                    │  📍 ঢাকা, বাংলাদেশ                 │
│  বিষয় *                    │                                   │
│  [Input]                    │  সামাজিক মাধ্যম                    │
│  বার্তা *                   │  [FB] [X] [IG]                    │
│  [Textarea]                 │                                   │
│  [পাঠান]                    │                                   │
└─────────────────────────────┴───────────────────────────────────┘
```

### 5.3 Rules (`/rules`)

Already implemented - uses `PlatformSetting` model with tabs:

- বিক্রেতার নিয়মাবলী (Seller Rules)
- লেখকের নিয়মাবলী (Author Rules)
- সেবার শর্তাবলী (Terms of Service)
- গোপনীয়তা নীতি (Privacy Policy)

### 5.4 Privacy Policy (`/privacy`)

Standalone page pulling from `PlatformSetting::getPrivacyPolicy()`

### 5.5 Terms of Service (`/terms`)

Standalone page pulling from `PlatformSetting::getTermsOfService()`

---

## SEO Implementation

### Using RalphJSmit Laravel SEO Package

The package is already installed and configured. Here's how to maximize SEO:

### 6.1 Model SEO Data

Each model with `HasSEO` trait should implement `getDynamicSEOData()`:

```php
// Post Model
public function getDynamicSEOData(): SEOData
{
    return new SEOData(
        title: $this->title,
        description: $this->meta_description ?: Str::limit(strip_tags($this->excerpt), 160),
        image: $this->getFirstMediaUrl('featured', 'large'),
        author: $this->user->name,
        published_time: $this->published_at,
        section: $this->categories->first()?->name_bn,
        tags: $this->tags?->pluck('name')->toArray(),
        schema: SchemaCollection::make()
            ->addArticle()
            ->addBreadcrumbList(fn($b) => $b->prependBreadcrumbs([
                'হোম' => url('/'),
                $this->categories->first()?->name_bn => $this->categories->first()?->url,
            ])),
    );
}

// Product Model
public function getDynamicSEOData(): SEOData
{
    return new SEOData(
        title: $this->name,
        description: $this->meta_description ?: Str::limit(strip_tags($this->description), 160),
        image: $this->getFirstMediaUrl('images', 'large'),
        schema: SchemaCollection::make()
            ->add(fn() => [
                '@context' => 'https://schema.org',
                '@type' => 'Product',
                'name' => $this->name,
                'description' => $this->description,
                'image' => $this->getFirstMediaUrl('images'),
                'offers' => [
                    '@type' => 'Offer',
                    'price' => $this->price_in_taka,
                    'priceCurrency' => 'BDT',
                    'availability' => $this->stock > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                ],
            ])
            ->addBreadcrumbList(),
    );
}

// Category Model
public function getDynamicSEOData(): SEOData
{
    return new SEOData(
        title: $this->name_bn,
        description: $this->meta_description ?: $this->description,
        image: $this->getFirstMediaUrl('image'),
        schema: SchemaCollection::make()->addBreadcrumbList(),
    );
}
```

### 6.2 Blade/Inertia Integration

In the public layout head:

```blade
{{-- In app.blade.php or via Inertia --}}
{!! seo()->for($model ?? null) !!}
```

Or pass SEO data via Inertia:

```php
// Controller
return Inertia::render('public/post/show', [
    'post' => $post,
    'seo' => $post->seo, // Automatically includes all meta tags
]);
```

### 6.3 Schema Markup Types

| Page Type | Schema                   |
| --------- | ------------------------ |
| Post      | Article + BreadcrumbList |
| Product   | Product + BreadcrumbList |
| Category  | BreadcrumbList           |
| Author    | Person + BreadcrumbList  |
| FAQ       | FAQPage                  |

### 6.4 Sitemap Generation

Use `spatie/laravel-sitemap` for automatic sitemap:

```php
// routes/console.php
Schedule::command('sitemap:generate')->daily();

// app/Console/Commands/GenerateSitemap.php
Sitemap::create()
    ->add(Url::create('/'))
    ->add(Url::create('/about'))
    ->add(Url::create('/contact'))
    ->add(Url::create('/shop'))
    ->add(Post::published()->get())
    ->add(Product::active()->get())
    ->add(Category::active()->get())
    ->add(Author::active()->get())
    ->writeToFile(public_path('sitemap.xml'));
```

---

## Routes Summary

### Public Routes (No Auth Required)

| Route                      | Page             | Controller                         |
| -------------------------- | ---------------- | ---------------------------------- |
| `/`                        | Home             | `HomeController@index`             |
| `/posts`                   | All Posts        | `PublicPostController@index`       |
| `/category/{slug}`         | Category Posts   | `PublicPostController@category`    |
| `/post/{slug}`             | Single Post      | `PublicPostController@show`        |
| `/authors`                 | All Authors      | `PublicAuthorController@index`     |
| `/author/{slug}`           | Author Profile   | `PublicAuthorController@show`      |
| `/shop`                    | Shop             | `PublicProductController@index`    |
| `/product-category/{slug}` | Product Category | `PublicProductController@category` |
| `/product/{slug}`          | Product Detail   | `PublicProductController@show`     |
| `/cart`                    | Cart             | `CartController@index`             |
| `/about`                   | About Us         | `PageController@about`             |
| `/contact`                 | Contact          | `PageController@contact`           |
| `/rules`                   | Rules            | `RulesController@index`            |
| `/privacy`                 | Privacy Policy   | `PageController@privacy`           |
| `/terms`                   | Terms of Service | `PageController@terms`             |

### Auth Required Routes

| Route                | Page         | Controller                  |
| -------------------- | ------------ | --------------------------- |
| `/checkout`          | Checkout     | `CheckoutController@index`  |
| `/my-orders`         | My Orders    | `OrderController@index`     |
| `/my-orders/{order}` | Order Detail | `OrderController@buyerShow` |

---

## Component Structure

```
resources/js/
├── components/
│   └── public/
│       ├── layout/
│       │   ├── PublicLayout.tsx
│       │   ├── PublicHeader.tsx
│       │   ├── PublicFooter.tsx
│       │   ├── MobileMenu.tsx
│       │   └── Breadcrumb.tsx (reuse from dashboard)
│       ├── home/
│       │   ├── HeroSection.tsx
│       │   ├── SearchBar.tsx
│       │   └── CategoryPills.tsx
│       ├── blog/
│       │   ├── PostCard.tsx
│       │   ├── PostGrid.tsx
│       │   ├── AuthorAvatar.tsx
│       │   ├── AuthorCard.tsx
│       │   ├── CategoryCard.tsx
│       │   ├── CommentSection.tsx
│       │   ├── CommentForm.tsx
│       │   ├── CommentThread.tsx
│       │   └── PostActions.tsx (like, bookmark, share)
│       ├── shop/
│       │   ├── ProductCard.tsx
│       │   ├── ProductGrid.tsx
│       │   ├── ProductGallery.tsx
│       │   ├── ProductFilters.tsx
│       │   ├── PriceDisplay.tsx
│       │   ├── QuantitySelector.tsx
│       │   ├── AddToCartButton.tsx
│       │   └── ReviewSection.tsx
│       ├── cart/
│       │   ├── CartItem.tsx
│       │   ├── CartSummary.tsx
│       │   └── CartIcon.tsx
│       └── shared/
│           ├── SectionHeader.tsx
│           ├── StatsCards.tsx
│           ├── Pagination.tsx
│           ├── EmptyState.tsx
│           └── LoadingState.tsx
├── pages/
│   └── public/
│       ├── home/
│       │   └── index.tsx
│       ├── posts/
│       │   ├── index.tsx
│       │   ├── category.tsx
│       │   └── show.tsx
│       ├── authors/
│       │   ├── index.tsx
│       │   └── show.tsx
│       ├── shop/
│       │   ├── index.tsx
│       │   ├── category.tsx
│       │   └── show.tsx
│       ├── cart/
│       │   └── index.tsx
│       ├── checkout/
│       │   └── index.tsx
│       └── pages/
│           ├── about.tsx
│           ├── contact.tsx
│           ├── privacy.tsx
│           └── terms.tsx
```

---

## Implementation Order

### Week 1: Foundation

1. ✅ Create `PublicLayout`, `PublicHeader`, `PublicFooter`
2. ✅ Implement nested category dropdown (blog + product)
3. ✅ Add cart icon with badge
4. ✅ Mobile responsive menu

### Week 2: Home & Blog

1. ✅ Home page with all sections
2. ✅ Posts listing with pagination
3. ✅ Category pages
4. ✅ Single post with comments

### Week 3: Authors & SEO

1. ✅ Authors listing
2. ✅ Author profile (hybrid: posts + products)
3. ✅ SEO implementation for all pages
4. ✅ Sitemap generation

### Week 4: E-commerce

1. ✅ Shop page with filters
2. ✅ Product detail page
3. ✅ Cart page
4. ✅ Checkout flow

### Week 5: Static & Polish

1. ✅ About Us page (preserve old content)
2. ✅ Contact page
3. ✅ Privacy & Terms pages
4. ✅ Final testing & optimization

---

## Notes

1. **Auth pages**: Do NOT modify - already complete
2. **Dashboard**: Do NOT modify now - permission-based visibility to be added later
3. **Breadcrumbs**: Reuse existing dashboard breadcrumb component
4. **Categories**: Use `HasRecursiveRelationships` trait for nested queries
5. **SEO**: Implement `getDynamicSEOData()` on all public-facing models
6. **Bengali**: All UI text should be in Bengali first, with English fallbacks
