# Post Multi-Page System

## Overview

Posts support multiple pages for long-form content like novels. Page 1 is the main post content, additional pages (2+) are stored separately.

## Database Schema

### posts table

- `content` - Page 1 content (main content)
- `pages_count` - Number of extra pages (not including page 1)

### post_pages table

- `post_id` - Foreign key to posts
- `content` - Page content (nullable on create, required on save)
- `order` - Page number (2, 3, 4...)
- Unique constraint on `(post_id, order)`

## Key Files

### Backend

- `app/Models/Post.php` - Post model with `pages()` relationship
- `app/Models/PostPage.php` - PostPage model
- `app/Http/Controllers/PostController.php` - Edit method passes `pageOrders`
- `app/Http/Controllers/PostPageController.php` - CRUD for pages
- `app/Http/Requests/Post/UpdatePostPageRequest.php` - Validation

### Frontend

- `resources/js/pages/dashboard/posts/edit.tsx` - Edit page with multi-page UI
- `resources/js/types/models.ts` - TypeScript types

## How It Works

### Page Navigation

1. Backend loads post with `pages` relationship
2. Extracts actual page orders: `$pageOrders = $post->pages->pluck('order')->toArray()`
3. Frontend receives `pageOrders` array (e.g., `[4, 5]` if pages 2-3 were deleted)
4. Navigation buttons show: `[1, ...pageOrders]` = `[1, 4, 5]`

### Creating New Page

1. Frontend validates current page has content (client-side)
2. Backend validates current page has saved content (server-side)
3. Uses `lockForUpdate()` to prevent race conditions
4. Creates page with next order number: `max(order) + 1`
5. Increments `posts.pages_count`

### Editing Pages

- Page 1: Uses main `form` with all post fields
- Page 2+: Uses separate `pageForm` with only `content` field
- `useEffect` syncs form content when navigating between pages

### Deleting Pages

1. Validates page belongs to post
2. Deletes page and decrements `pages_count` in transaction
3. Redirects to previous page or main post

## URL Structure

```
/dashboard/posts/{slug}/edit          # Page 1 (main post)
/dashboard/posts/{slug}/edit?page=2   # Page 2
/dashboard/posts/{slug}/edit?page=4   # Page 4 (even if 2-3 deleted)
```

## API Routes

```php
POST   /dashboard/posts/{post}/pages              # Create new page
PUT    /dashboard/posts/{post}/pages/{page}       # Update page content
DELETE /dashboard/posts/{post}/pages/{page}       # Delete page
```

## Important Notes

1. **Order gaps are allowed** - Deleting pages doesn't reorder remaining pages
2. **Content validation** - Can't create new page without content in current page
3. **Race condition protection** - Uses `lockForUpdate()` when creating pages
4. **Total pages** = `1 + pages_count` (page 1 is always the main post)
5. **Display in table** - Shows `(pages_count ?? 0) + 1` for total pages
