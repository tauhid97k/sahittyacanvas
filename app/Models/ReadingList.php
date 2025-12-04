<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ReadingList extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Public lists
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope: Private lists
     */
    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the owner
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get list items
     */
    public function items(): HasMany
    {
        return $this->hasMany(ReadingListItem::class)->orderBy('position');
    }

    /**
     * Get posts in this list (via pivot)
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'reading_list_items')
            ->withPivot('position')
            ->withTimestamps()
            ->orderByPivot('position');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get posts count
     */
    public function getPostsCountAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Check if list contains a post
     */
    public function containsPost(Post $post): bool
    {
        return $this->items()->where('post_id', $post->id)->exists();
    }

    /**
     * Add post to list
     */
    public function addPost(Post $post, ?int $position = null): ReadingListItem
    {
        $position = $position ?? ($this->items()->max('position') + 1);
        
        return $this->items()->create([
            'post_id' => $post->id,
            'position' => $position,
        ]);
    }

    /**
     * Remove post from list
     */
    public function removePost(Post $post): bool
    {
        return $this->items()->where('post_id', $post->id)->delete() > 0;
    }
}
