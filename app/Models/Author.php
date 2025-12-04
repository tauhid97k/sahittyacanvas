<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use RalphJSmit\Laravel\SEO\Support\SEOData;

class Author extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, HasSEO;

    protected $fillable = [
        'name_bn',
        'name_en',
        'slug',
        'bio',
        'birth_date',
        'death_date',
        'nationality',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'death_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name_bn', 'name_en', 'slug', 'bio', 'is_active'])
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
            description: $this->bio ? str()->limit($this->bio, 160) : null,
            image: $this->getFirstMediaUrl('avatar'),
        );
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('banner')
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
            ->width(400)
            ->height(400);
    }

    /**
     * Scope: Only active authors
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get posts attributed to this author
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get followers (polymorphic)
     */
    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
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
}
