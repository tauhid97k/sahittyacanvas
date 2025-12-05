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
    user_id: number;
    author_id: number | null;
    title_bn: string;
    title_en: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_description: string | null;
    status: 'draft' | 'pending' | 'published' | 'archived';
    published_at: string | null;
    requires_approval: boolean;
    approved_at: string | null;
    approved_by: number | null;
    created_at: string;
    updated_at: string;
    // Relations
    categories?: Category[];
    author?: Author | null;
    user?: User;
    pages?: PostPage[];
    // Counts
    likes_count?: number;
    comments_count?: number;
    bookmarks_count?: number;
    pages_count?: number;
    visit_count_total?: number;
    // Computed
    featured_image_url?: string | null;
}

export interface PostPage {
    id: number;
    post_id: number;
    content: string;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface Author {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    bio: string | null;
    birth_date: string | null;
    death_date: string | null;
    nationality: string | null;
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
