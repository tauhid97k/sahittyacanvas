<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Follow extends Model
{
    use HasFactory;

    protected $fillable = [
        'follower_id',
        'followable_type',
        'followable_id',
        'notify_new_posts',
        'notify_via_email',
        'notify_via_push',
    ];

    protected function casts(): array
    {
        return [
            'notify_new_posts' => 'boolean',
            'notify_via_email' => 'boolean',
            'notify_via_push' => 'boolean',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the follower (user)
     */
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    /**
     * Get the followable model (User or Author)
     */
    public function followable(): MorphTo
    {
        return $this->morphTo();
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Following users
     */
    public function scopeUsers($query)
    {
        return $query->where('followable_type', User::class);
    }

    /**
     * Scope: Following authors
     */
    public function scopeAuthors($query)
    {
        return $query->where('followable_type', Author::class);
    }

    /**
     * Scope: With notifications enabled
     */
    public function scopeWithNotifications($query)
    {
        return $query->where('notify_new_posts', true);
    }

    // ==================== BOOT ====================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Update counters on create
        static::created(function ($follow) {
            // Increment follower's following_count
            $follow->follower->increment('following_count');
            
            // Increment followable's followers_count (if User)
            if ($follow->followable_type === User::class) {
                $follow->followable->increment('followers_count');
            }
        });

        // Update counters on delete
        static::deleted(function ($follow) {
            // Decrement follower's following_count
            $follow->follower->decrement('following_count');
            
            // Decrement followable's followers_count (if User)
            if ($follow->followable_type === User::class) {
                $follow->followable->decrement('followers_count');
            }
        });
    }
}
