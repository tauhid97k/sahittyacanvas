<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PostPage extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'post_id',
        'title',
        'content',
        'order',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'order', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Published pages
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: Draft pages
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Order by position
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the parent post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if page is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Get word count
     */
    public function getWordCountAttribute(): int
    {
        return str_word_count(strip_tags($this->content));
    }

    /**
     * Get reading time in minutes
     */
    public function getReadingTimeAttribute(): int
    {
        return max(1, (int) ceil($this->word_count / 200));
    }

    /**
     * Get page number (calculated from order position)
     */
    public function getPageNumberAttribute(): int
    {
        return $this->post->pages()
            ->where('order', '<=', $this->order)
            ->count();
    }

    /**
     * Get next page
     */
    public function getNextPageAttribute(): ?PostPage
    {
        return $this->post->pages()
            ->where('order', '>', $this->order)
            ->orderBy('order')
            ->first();
    }

    /**
     * Get previous page
     */
    public function getPreviousPageAttribute(): ?PostPage
    {
        return $this->post->pages()
            ->where('order', '<', $this->order)
            ->orderBy('order', 'desc')
            ->first();
    }
}
