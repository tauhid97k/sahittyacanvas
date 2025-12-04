<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Report extends Model
{
    use HasFactory, LogsActivity;

    /**
     * Available report types
     */
    public const TYPES = [
        'spam' => 'Spam',
        'inappropriate' => 'Inappropriate Content',
        'copyright' => 'Copyright Violation',
        'harassment' => 'Harassment',
        'misinformation' => 'Misinformation',
        'other' => 'Other',
    ];

    /**
     * Available statuses
     */
    public const STATUSES = [
        'pending' => 'Pending Review',
        'reviewing' => 'Under Review',
        'resolved' => 'Resolved',
        'dismissed' => 'Dismissed',
    ];

    protected $fillable = [
        'reporter_id',
        'reportable_type',
        'reportable_id',
        'report_type',
        'reason',
        'status',
        'admin_notes',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'admin_notes', 'resolved_by'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Pending reports
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Under review
     */
    public function scopeReviewing($query)
    {
        return $query->where('status', 'reviewing');
    }

    /**
     * Scope: Resolved reports
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope: Dismissed reports
     */
    public function scopeDismissed($query)
    {
        return $query->where('status', 'dismissed');
    }

    /**
     * Scope: By type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('report_type', $type);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the reporter
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Get the reported model (Post, Comment, User, Author)
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the resolver (admin/moderator)
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if report is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if report is resolved
     */
    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    /**
     * Resolve the report
     */
    public function resolve(User $resolver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_by' => $resolver->id,
            'resolved_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Dismiss the report
     */
    public function dismiss(User $resolver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'dismissed',
            'resolved_by' => $resolver->id,
            'resolved_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->report_type] ?? $this->report_type;
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }
}
