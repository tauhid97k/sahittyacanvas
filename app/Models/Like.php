<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'post_id',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user who liked
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the liked post
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

        // Increment post likes_count on create
        static::created(function ($like) {
            $like->post->increment('likes_count');
        });

        // Decrement post likes_count on delete
        static::deleted(function ($like) {
            $like->post->decrement('likes_count');
        });
    }
}
