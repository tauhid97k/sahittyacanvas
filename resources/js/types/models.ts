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
    status: 'draft' | 'published' | 'archived';
    published_at: string | null;
    moderation_status: 'auto' | 'pending' | 'approved' | 'rejected';
    moderated_at: string | null;
    moderated_by: number | null;
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
    // Counts
    posts_count?: number;
    // Computed
    avatar_url?: string | null;
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

// ==================== ECOMMERCE MODELS ====================

export interface ProductCategory {
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
    parent?: ProductCategoryParent | null;
    children?: ProductCategory[];
    // Counts
    products_count?: number;
    children_count?: number;
    // Computed
    image_url?: string | null;
}

export interface ProductCategoryParent {
    id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
}

export interface Product {
    id: number;
    user_id: number;
    name_bn: string;
    name_en: string | null;
    slug: string;
    description: string | null;
    price: number; // In cents/paisa
    discount_type: 'percentage' | 'flat' | null;
    discount_value: number | null; // Percentage (0-100) or flat amount in paisa
    stock_count: number;
    stock_alert_threshold: number;
    sku: string | null;
    status: 'draft' | 'published' | 'archived';
    moderation_status: 'auto' | 'pending' | 'approved' | 'rejected';
    moderated_at: string | null;
    moderated_by: number | null;
    published_at: string | null;
    sales_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
    // Relations
    user?: User;
    seller?: User;
    categories?: ProductCategory[];
    // Computed
    price_in_taka?: number;
    discounted_price?: number;
    discounted_price_in_taka?: number;
    discount_amount?: number;
    discount_amount_in_taka?: number;
    discount_percentage?: number | null;
    discount_value_in_taka?: number | null;
    formatted_price?: string;
    formatted_discounted_price?: string;
    formatted_discount_amount?: string | null;
    featured_image_url?: string | null;
    image_urls?: string[];
    display_name?: string;
    average_rating?: number | null;
    review_count?: number;
    rating_distribution?: Record<number, number>;
}

export interface ProductReview {
    id: number;
    product_id: number;
    user_id: number;
    order_id: number;
    rating: number;
    review: string | null;
    is_verified_purchase: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    user?: User;
    product?: Product;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    seller_id: number;
    subtotal: number; // In cents/paisa
    shipping_cost: number; // In cents/paisa
    total: number; // In cents/paisa
    status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
    payment_status: 'unpaid' | 'paid' | 'refunded';
    payment_method: string | null;
    payment_note: string | null;
    shipping_name: string;
    shipping_phone: string;
    shipping_email: string | null;
    shipping_address: string;
    shipping_city: string;
    shipping_area: string | null;
    shipping_postal_code: string | null;
    buyer_notes: string | null;
    tracking_number: string | null;
    shipping_provider: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    seller_notes: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    notes?: string | null;
    // Relations
    buyer?: User;
    seller?: User;
    items?: OrderItem[];
    transactions?: Transaction[];
    transaction?: Transaction; // First/primary transaction
    // Computed
    subtotal_in_taka?: number;
    shipping_cost_in_taka?: number;
    total_in_taka?: number;
    formatted_subtotal?: string;
    formatted_shipping_cost?: string;
    formatted_total?: string;
    status_label?: string;
    payment_status_label?: string;
    total_items?: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number; // In cents/paisa
    total: number; // In cents/paisa
    created_at: string;
    updated_at: string;
    // Relations
    product?: Product | null;
    // Computed
    unit_price_in_taka?: number;
    total_in_taka?: number;
    formatted_unit_price?: string;
    formatted_total?: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    instructions: string | null;
    icon: string | null;
    is_active: boolean;
    is_cod: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    transaction_number: string;
    transactionable_type: string;
    transactionable_id: number;
    payer_id: number;
    payee_id: number;
    payment_method_id: number | null;
    amount: number; // In cents/paisa
    currency: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    gateway_transaction_id: string | null;
    gateway_response: Record<string, unknown> | null;
    note: string | null;
    paid_at: string | null;
    refunded_at: string | null;
    failed_at: string | null;
    failure_reason: string | null;
    refund_amount: number | null;
    refund_reason: string | null;
    refunded_by: number | null;
    created_at: string;
    updated_at: string;
    // Relations
    payer?: User;
    payee?: User;
    paymentMethod?: PaymentMethod;
    transactionable?: Order; // Can be extended for other types
    refundedByUser?: User;
    // Computed
    amount_in_taka?: number;
    formatted_amount?: string;
    refund_amount_in_taka?: number | null;
    formatted_refund_amount?: string | null;
    status_label?: string;
    status_color?: string;
    transactionable_info?: {
        type: string;
        number: string;
        route: string | null;
    };
}
