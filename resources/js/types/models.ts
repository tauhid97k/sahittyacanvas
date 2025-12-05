/**
 * Model Types
 * These types match Laravel Eloquent models
 */

export interface Category {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    description: string | null;
    meta_description: string | null;
    parent_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    parent?: CategoryParent | null;
    children?: Category[];
    // Counts
    posts_count?: number;
    children_count?: number;
    // Computed
    display_name?: string;
    breadcrumb?: Array<{ name: string; slug: string }>;
    image_url?: string;
}

export interface CategoryParent {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    category?: Category;
    author?: Author;
    user?: User;
    // Counts
    likes_count?: number;
    comments_count?: number;
    bookmarks_count?: number;
}

export interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    bio: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    username: string | null;
    email: string;
    avatar?: string;
    bio: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}
