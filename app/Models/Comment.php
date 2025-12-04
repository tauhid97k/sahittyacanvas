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
        'is_approved',
        'replies_count',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'replies_count' => 'integer',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['content', 'is_approved'])
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
     * Scope: Approved comments
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope: Pending approval
     */
    public function scopePending($query)
    {
        return $query->where('is_approved', false);
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

    // ==================== HELPER METHODS ====================

    /**
     * Check if comment is approved
     */
    public function isApproved(): bool
    {
        return $this->is_approved === true;
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
