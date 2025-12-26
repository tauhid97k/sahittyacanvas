<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use RalphJSmit\Laravel\SEO\Support\SEOData;
use RalphJSmit\Laravel\SEO\SchemaCollection;

class Product extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia, LogsActivity, HasSEO;

    protected $fillable = [
        'user_id',
        'name_bn',
        'name_en',
        'slug',
        'description',
        'price',
        'discount_type',
        'discount_value',
        'stock_count',
        'stock_alert_threshold',
        'sku',
        'status',
        'moderation_status',
        'moderated_at',
        'moderated_by',
        'published_at',
        'sales_count',
        'views_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'discount_value' => 'integer',
            'stock_count' => 'integer',
            'stock_alert_threshold' => 'integer',
            'sales_count' => 'integer',
            'views_count' => 'integer',
            'published_at' => 'datetime',
            'moderated_at' => 'datetime',
        ];
    }

    // ==================== PRICE ACCESSORS/MUTATORS ====================

    /**
     * Get price in taka (from paisa)
     */
    public function getPriceInTakaAttribute(): float
    {
        return $this->price / 100;
    }

    /**
     * Get discounted price in paisa
     */
    public function getDiscountedPriceAttribute(): int
    {
        if (!$this->discount_type || !$this->discount_value) {
            return $this->price;
        }

        if ($this->discount_type === 'percentage') {
            return (int) round($this->price * (1 - $this->discount_value / 100));
        }

        // Flat discount (discount_value is in paisa)
        return max(0, $this->price - $this->discount_value);
    }

    /**
     * Get discounted price in taka
     */
    public function getDiscountedPriceInTakaAttribute(): float
    {
        return $this->discounted_price / 100;
    }

    /**
     * Get discount amount in paisa
     */
    public function getDiscountAmountAttribute(): int
    {
        return $this->price - $this->discounted_price;
    }

    /**
     * Get discount amount in taka
     */
    public function getDiscountAmountInTakaAttribute(): float
    {
        return $this->discount_amount / 100;
    }

    /**
     * Set price from taka (to paisa)
     */
    public function setPriceFromTaka(float $taka): void
    {
        $this->price = (int) round($taka * 100);
    }

    /**
     * Get formatted price (original)
     */
    public function getFormattedPriceAttribute(): string
    {
        return '৳' . number_format($this->price_in_taka, 2);
    }

    /**
     * Get formatted discounted price
     */
    public function getFormattedDiscountedPriceAttribute(): string
    {
        return '৳' . number_format($this->discounted_price_in_taka, 2);
    }

    /**
     * Get formatted discount amount
     */
    public function getFormattedDiscountAmountAttribute(): ?string
    {
        if (!$this->hasDiscount()) {
            return null;
        }
        return '৳' . number_format($this->discount_amount_in_taka, 2);
    }

    /**
     * Check if product has a discount
     */
    public function hasDiscount(): bool
    {
        return $this->discount_type && $this->discount_value > 0;
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name_bn', 'name_en', 'slug', 'price', 'status', 'moderation_status', 'stock_count'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Dynamic SEO data
     */
    public function getDynamicSEOData(): SEOData
    {
        return new SEOData(
            title: $this->name_bn,
            description: str()->limit(strip_tags($this->description), 160),
            image: $this->getFirstMediaUrl('images'),
            schema: SchemaCollection::make()->addProduct(),
        );
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('featured')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10);

        $this->addMediaConversion('medium')
            ->width(600)
            ->height(600);

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(1200);
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Published products
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope: Draft products
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Archived products
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope: Pending moderation
     */
    public function scopePendingModeration($query)
    {
        return $query->where('moderation_status', 'pending');
    }

    /**
     * Scope: Approved (auto or manually approved)
     */
    public function scopeApproved($query)
    {
        return $query->whereIn('moderation_status', ['auto', 'approved']);
    }

    /**
     * Scope: Rejected
     */
    public function scopeRejected($query)
    {
        return $query->where('moderation_status', 'rejected');
    }

    /**
     * Scope: Visible to public (published + approved)
     */
    public function scopeVisible($query)
    {
        return $query->where('status', 'published')
            ->whereIn('moderation_status', ['auto', 'approved'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope: In stock
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_count', '>', 0);
    }

    /**
     * Scope: Low stock
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_count', '<=', 'stock_alert_threshold')
            ->where('stock_count', '>', 0);
    }

    /**
     * Scope: Out of stock
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('stock_count', 0);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the seller (user who created the product)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Alias for user - the seller
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the moderator who moderated
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * Get the categories (many-to-many)
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ProductCategory::class, 'category_product', 'product_id', 'product_category_id')
            ->withTimestamps();
    }

    /**
     * Get order items for this product
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get cart items for this product
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Check if product is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published'
            && $this->published_at
            && $this->published_at->isPast();
    }

    /**
     * Check if product is visible to public
     */
    public function isVisible(): bool
    {
        return $this->isPublished()
            && in_array($this->moderation_status, ['auto', 'approved']);
    }

    /**
     * Check if product is pending moderation
     */
    public function isPendingModeration(): bool
    {
        return $this->moderation_status === 'pending';
    }

    /**
     * Check if product is rejected
     */
    public function isRejected(): bool
    {
        return $this->moderation_status === 'rejected';
    }

    /**
     * Check if product is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock_count > 0;
    }

    /**
     * Check if product has low stock
     */
    public function isLowStock(): bool
    {
        return $this->stock_count > 0 && $this->stock_count <= $this->stock_alert_threshold;
    }

    /**
     * Check if product is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_count === 0;
    }

    /**
     * Get display name (prefers Bengali)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name_bn ?: $this->name_en;
    }

    /**
     * Get featured image URL
     */
    public function getFeaturedImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('featured', 'large')
            ?: $this->getFirstMediaUrl('images', 'large')
            ?: null;
    }

    /**
     * Get all image URLs
     */
    public function getImageUrlsAttribute(): array
    {
        return $this->getMedia('images')->map(fn($media) => $media->getUrl('medium'))->toArray();
    }

    /**
     * Get discount percentage (for display)
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->hasDiscount()) {
            return null;
        }

        if ($this->discount_type === 'percentage') {
            return $this->discount_value;
        }

        // Calculate percentage from flat discount
        if ($this->price > 0) {
            return (int) round(($this->discount_value / $this->price) * 100);
        }

        return null;
    }

    /**
     * Get discount value in taka (for flat discounts)
     */
    public function getDiscountValueInTakaAttribute(): ?float
    {
        if ($this->discount_type !== 'flat' || !$this->discount_value) {
            return null;
        }
        return $this->discount_value / 100;
    }

    /**
     * Decrement stock
     */
    public function decrementStock(int $quantity = 1): bool
    {
        if ($this->stock_count < $quantity) {
            return false;
        }

        $this->decrement('stock_count', $quantity);
        return true;
    }

    /**
     * Increment stock
     */
    public function incrementStock(int $quantity = 1): void
    {
        $this->increment('stock_count', $quantity);
    }

    /**
     * Increment sales count
     */
    public function incrementSales(int $quantity = 1): void
    {
        $this->increment('sales_count', $quantity);
    }
}
