<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    use HasFactory;

    /**
     * Available notification types
     */
    public const TYPES = [
        'new_post' => 'New post from followed user/author',
        'new_comment' => 'Comment on user\'s post',
        'comment_reply' => 'Reply to user\'s comment',
        'post_liked' => 'Someone liked user\'s post',
        'post_bookmarked' => 'Someone bookmarked user\'s post',
        'mention' => 'User mentioned in comment (@username)',
        'system' => 'System announcements',
        'moderation' => 'Content moderation updates',
    ];

    /**
     * Available channels
     */
    public const CHANNELS = [
        'database',
        'mail',
        'broadcast',
    ];

    protected $fillable = [
        'user_id',
        'notification_type',
        'channels',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'is_enabled' => 'boolean',
        ];
    }

    /**
     * Default channels attribute
     */
    protected $attributes = [
        'channels' => '["database"]',
        'is_enabled' => true,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Enabled settings
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope: By type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('notification_type', $type);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if channel is enabled
     */
    public function hasChannel(string $channel): bool
    {
        return in_array($channel, $this->channels ?? ['database']);
    }

    /**
     * Enable a channel
     */
    public function enableChannel(string $channel): void
    {
        $channels = $this->channels ?? [];
        
        if (!in_array($channel, $channels)) {
            $channels[] = $channel;
            $this->update(['channels' => $channels]);
        }
    }

    /**
     * Disable a channel
     */
    public function disableChannel(string $channel): void
    {
        $channels = $this->channels ?? [];
        $channels = array_filter($channels, fn($c) => $c !== $channel);
        $this->update(['channels' => array_values($channels)]);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->notification_type] ?? $this->notification_type;
    }
}
