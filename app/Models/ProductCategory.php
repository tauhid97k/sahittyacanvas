<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class ProductCategory extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, HasRecursiveRelationships;

    protected $fillable = [
        'name_bn',
        'name_en',
        'slug',
        'description',
        'meta_description',
        'parent_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name_bn', 'name_en', 'slug', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10);
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Root categories (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Ordered by name
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('name_bn');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get products in this category
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'category_product', 'product_category_id', 'product_id')
            ->withTimestamps();
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
     * Get display name (prefers Bengali)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name_bn ?: $this->name_en;
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('image') ?: null;
    }

    /**
     * Get breadcrumb path
     */
    public function getBreadcrumbAttribute(): array
    {
        return $this->ancestorsAndSelf()
            ->get()
            ->map(fn($cat) => ['name' => $cat->name_bn, 'slug' => $cat->slug])
            ->toArray();
    }
}
