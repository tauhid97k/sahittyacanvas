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
use Coderflex\Laravisit\Concerns\CanVisit;
use Coderflex\Laravisit\Concerns\HasVisits;

class Post extends Model implements HasMedia, CanVisit
{
    use HasFactory, SoftDeletes, InteractsWithMedia, LogsActivity, HasSEO, HasVisits;

    protected $fillable = [
        'user_id',
        'author_id',
        'title_bn',
        'title_en',
        'slug',
        'excerpt',
        'content',
        'meta_description',
        'featured_image',
        'status',
        'published_at',
        'moderation_status',
        'moderated_at',
        'moderated_by',
        'likes_count',
        'comments_count',
        'bookmarks_count',
        'pages_count',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'moderated_at' => 'datetime',
            'likes_count' => 'integer',
            'comments_count' => 'integer',
            'bookmarks_count' => 'integer',
            'pages_count' => 'integer',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title_bn', 'title_en', 'slug', 'status', 'moderation_status'])
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
     * Scope: Archived posts
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
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
     * Get the categories (many-to-many)
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    /**
     * Get the moderator who moderated
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * Get post pages (for multi-page posts)
     */
    public function pages(): HasMany
    {
        return $this->hasMany(PostPage::class)->orderBy('order');
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
     * Check if post is visible to public
     */
    public function isVisible(): bool
    {
        return $this->isPublished() 
            && in_array($this->moderation_status, ['auto', 'approved']);
    }

    /**
     * Check if post is pending moderation
     */
    public function isPendingModeration(): bool
    {
        return $this->moderation_status === 'pending';
    }

    /**
     * Check if post is rejected
     */
    public function isRejected(): bool
    {
        return $this->moderation_status === 'rejected';
    }

    /**
     * Check if post has multiple pages
     */
    public function hasPages(): bool
    {
        return $this->pages_count > 0;
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
