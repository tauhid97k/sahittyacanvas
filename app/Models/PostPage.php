<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'content',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    // ==================== SCOPES ====================

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
