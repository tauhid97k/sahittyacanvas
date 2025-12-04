<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bookmark extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'post_id',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user who bookmarked
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bookmarked post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // ==================== BOOT ====================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Increment post bookmarks_count on create
        static::created(function ($bookmark) {
            $bookmark->post->increment('bookmarks_count');
        });

        // Decrement post bookmarks_count on delete
        static::deleted(function ($bookmark) {
            $bookmark->post->decrement('bookmarks_count');
        });
    }
}
