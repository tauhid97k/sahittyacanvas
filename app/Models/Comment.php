<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class Comment extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, HasRecursiveRelationships;

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content',
        'moderation_status',
        'moderated_at',
        'moderated_by',
        'replies_count',
    ];

    protected function casts(): array
    {
        return [
            'moderated_at' => 'datetime',
            'replies_count' => 'integer',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['content', 'moderation_status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the parent key name for adjacency list
     */
    public function getParentKeyName(): string
    {
        return 'parent_id';
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Visible comments (auto or approved)
     */
    public function scopeVisible($query)
    {
        return $query->whereIn('moderation_status', ['auto', 'approved']);
    }

    /**
     * Scope: Pending moderation
     */
    public function scopePendingModeration($query)
    {
        return $query->where('moderation_status', 'pending');
    }

    /**
     * Scope: Rejected
     */
    public function scopeRejected($query)
    {
        return $query->where('moderation_status', 'rejected');
    }

    /**
     * Scope: Root comments (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who wrote the comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get reports for this comment (polymorphic)
     */
    public function reports(): MorphMany
    {
        return $this->morphMany(Report::class, 'reportable');
    }

    /**
     * Get the moderator who moderated
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if comment is visible (auto or approved)
     */
    public function isVisible(): bool
    {
        return in_array($this->moderation_status, ['auto', 'approved']);
    }

    /**
     * Check if comment is pending moderation
     */
    public function isPendingModeration(): bool
    {
        return $this->moderation_status === 'pending';
    }

    /**
     * Check if comment is rejected
     */
    public function isRejected(): bool
    {
        return $this->moderation_status === 'rejected';
    }

    /**
     * Check if comment has replies
     */
    public function hasReplies(): bool
    {
        return $this->replies_count > 0;
    }

    /**
     * Check if comment is a reply
     */
    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Get depth level (0 = root)
     */
    public function getDepthLevelAttribute(): int
    {
        return $this->ancestors()->count();
    }

    /**
     * Parse mentions from content (@username)
     */
    public function getMentionedUsernamesAttribute(): array
    {
        preg_match_all('/@([a-zA-Z0-9_]+)/', $this->content, $matches);
        return array_unique($matches[1] ?? []);
    }

    /**
     * Get mentioned users
     */
    public function getMentionedUsersAttribute()
    {
        $usernames = $this->mentioned_usernames;
        
        if (empty($usernames)) {
            return collect();
        }
        
        return User::whereIn('username', $usernames)->get();
    }
}
