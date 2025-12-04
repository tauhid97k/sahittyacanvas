<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactSubmission extends Model
{
    use HasFactory;

    /**
     * Available statuses
     */
    public const STATUSES = [
        'new' => 'New',
        'read' => 'Read',
        'replied' => 'Replied',
        'archived' => 'Archived',
    ];

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'status',
        'ip_address',
        'user_agent',
    ];

    // ==================== SCOPES ====================

    /**
     * Scope: New submissions
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope: Read submissions
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Scope: Replied submissions
     */
    public function scopeReplied($query)
    {
        return $query->where('status', 'replied');
    }

    /**
     * Scope: Archived submissions
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Mark as read
     */
    public function markAsRead(): void
    {
        $this->update(['status' => 'read']);
    }

    /**
     * Mark as replied
     */
    public function markAsReplied(): void
    {
        $this->update(['status' => 'replied']);
    }

    /**
     * Archive
     */
    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }
}
