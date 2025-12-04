<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'reading_list_id',
        'post_id',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the reading list
     */
    public function readingList(): BelongsTo
    {
        return $this->belongsTo(ReadingList::class);
    }

    /**
     * Get the post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Order by position
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('position');
    }
}
