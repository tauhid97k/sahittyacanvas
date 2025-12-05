<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use RalphJSmit\Laravel\SEO\Support\SEOData;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class Category extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, HasSEO, HasRecursiveRelationships;

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
            ->logOnly(['name_bn', 'name_en', 'slug', 'parent_id', 'is_active'])
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
            description: $this->meta_description ?: ($this->description ? str()->limit($this->description, 160) : null),
            image: $this->getFirstMediaUrl('image'),
        );
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

        $this->addMediaConversion('medium')
            ->width(600)
            ->height(400);
    }

    /**
     * Get the parent key name for adjacency list
     */
    public function getParentKeyName(): string
    {
        return 'parent_id';
    }

    /**
     * Scope: Only active categories
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
     * Scope: Order by name
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('name_bn');
    }

    /**
     * Get posts in this category (many-to-many)
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class)->withTimestamps();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get display name (Bengali preferred)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name_bn ?: $this->name_en;
    }

    /**
     * Get full path (breadcrumb)
     */
    public function getBreadcrumbAttribute(): array
    {
        return $this->ancestorsAndSelf()->ordered()->get()->map(fn($cat) => [
            'name' => $cat->display_name,
            'slug' => $cat->slug,
        ])->toArray();
    }
}
