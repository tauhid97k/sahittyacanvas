<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use RalphJSmit\Laravel\SEO\Support\HasSEO;
use RalphJSmit\Laravel\SEO\Support\SEOData;
use RalphJSmit\Laravel\SEO\SchemaCollection;
use Coderflex\Laravisit\Concerns\CanVisit;
use Coderflex\Laravisit\Concerns\HasVisits;

class Post extends Model implements HasMedia, CanVisit
{
    use HasFactory, SoftDeletes, InteractsWithMedia, LogsActivity, HasSEO, HasVisits;

    protected $fillable = [
        'user_id',
        'author_id',
        'category_id',
        'post_type_id',
        'title',
        'slug',
        'excerpt',
        'featured_image',
        'status',
        'published_at',
        'requires_approval',
        'approved_at',
        'approved_by',
        'likes_count',
        'comments_count',
        'bookmarks_count',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'approved_at' => 'datetime',
            'requires_approval' => 'boolean',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
            'bookmarks_count' => 'integer',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'status', 'category_id', 'post_type_id', 'requires_approval'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Dynamic SEO data
     */
    public function getDynamicSEOData(): SEOData
    {
        return new SEOData(
            title: $this->title,
            description: $this->excerpt ? str()->limit($this->excerpt, 160) : null,
            image: $this->getFirstMediaUrl('featured') ?: $this->featured_image,
            author: $this->user?->name,
            published_time: $this->published_at,
            schema: SchemaCollection::make()->addArticle(),
        );
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('attachments');
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(200)
            ->sharpen(10);

        $this->addMediaConversion('medium')
            ->width(800)
            ->height(600);

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(800);
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Published posts
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope: Draft posts
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Pending approval
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Archived posts
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope: Requires moderation
     */
    public function scopeRequiresModeration($query)
    {
        return $query->where('requires_approval', true)
            ->whereNull('approved_at');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user who created the post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the famous author (if attributed)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Get the category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the post type
     */
    public function postType(): BelongsTo
    {
        return $this->belongsTo(PostType::class);
    }

    /**
     * Get the moderator who approved
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get post pages (for multi-page posts)
     */
    public function pages(): HasMany
    {
        return $this->hasMany(PostPage::class)->orderBy('order');
    }

    /**
     * Get published pages only
     */
    public function publishedPages(): HasMany
    {
        return $this->hasMany(PostPage::class)
            ->where('status', 'published')
            ->orderBy('order');
    }

    /**
     * Get comments
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get root comments (no parent)
     */
    public function rootComments(): HasMany
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id');
    }

    /**
     * Get likes
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get bookmarks
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if post is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published' 
            && $this->published_at 
            && $this->published_at->isPast();
    }

    /**
     * Check if post is multi-page
     */
    public function isMultiPage(): bool
    {
        return $this->pages()->count() > 1;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get featured image URL
     */
    public function getFeaturedImageUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('featured', 'large') ?: $this->featured_image;
    }

    /**
     * Get reading time in minutes
     */
    public function getReadingTimeAttribute(): int
    {
        $totalWords = 0;
        
        foreach ($this->pages as $page) {
            $totalWords += str_word_count(strip_tags($page->content));
        }
        
        return max(1, (int) ceil($totalWords / 200));
    }
}
