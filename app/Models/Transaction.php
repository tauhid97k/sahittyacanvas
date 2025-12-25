<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Transaction extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'transaction_number',
        'transactionable_type',
        'transactionable_id',
        'payer_id',
        'payee_id',
        'payment_method_id',
        'amount',
        'currency',
        'status',
        'gateway_transaction_id',
        'gateway_response',
        'note',
        'paid_at',
        'refunded_at',
        'failed_at',
        'failure_reason',
        'refund_amount',
        'refund_reason',
        'refunded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'refund_amount' => 'integer',
            'status' => TransactionStatus::class,
            'gateway_response' => 'array',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'gateway_transaction_id', 'note'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_number)) {
                $transaction->transaction_number = self::generateTransactionNumber();
            }
        });
    }

    /**
     * Generate unique transaction number
     */
    public static function generateTransactionNumber(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));
        return "TXN-{$date}-{$random}";
    }

    // ==================== PRICE ACCESSORS ====================

    /**
     * Get amount in taka
     */
    public function getAmountInTakaAttribute(): float
    {
        return $this->amount / 100;
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        return '৳' . number_format($this->amount_in_taka, 2);
    }

    /**
     * Get refund amount in taka
     */
    public function getRefundAmountInTakaAttribute(): ?float
    {
        return $this->refund_amount ? $this->refund_amount / 100 : null;
    }

    /**
     * Get formatted refund amount
     */
    public function getFormattedRefundAmountAttribute(): ?string
    {
        return $this->refund_amount ? '৳' . number_format($this->refund_amount_in_taka, 2) : null;
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Pending transactions
     */
    public function scopePending($query)
    {
        return $query->where('status', TransactionStatus::PENDING);
    }

    /**
     * Scope: Paid transactions
     */
    public function scopePaid($query)
    {
        return $query->where('status', TransactionStatus::PAID);
    }

    /**
     * Scope: Refunded transactions
     */
    public function scopeRefunded($query)
    {
        return $query->where('status', TransactionStatus::REFUNDED);
    }

    /**
     * Scope: Failed transactions
     */
    public function scopeFailed($query)
    {
        return $query->where('status', TransactionStatus::FAILED);
    }

    /**
     * Scope: For payer (buyer)
     */
    public function scopeForPayer($query, int $userId)
    {
        return $query->where('payer_id', $userId);
    }

    /**
     * Scope: For payee (seller)
     */
    public function scopeForPayee($query, int $userId)
    {
        return $query->where('payee_id', $userId);
    }

    /**
     * Scope: For specific transactionable type
     */
    public function scopeForType($query, string $type)
    {
        return $query->where('transactionable_type', $type);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the transactionable model (Order, AdService, etc.)
     */
    public function transactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the payer (buyer)
     */
    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    /**
     * Get the payee (seller)
     */
    public function payee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payee_id');
    }

    /**
     * Get the payment method
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the user who processed refund
     */
    public function refundedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if transaction is pending
     */
    public function isPending(): bool
    {
        return $this->status === TransactionStatus::PENDING;
    }

    /**
     * Check if transaction is paid
     */
    public function isPaid(): bool
    {
        return $this->status === TransactionStatus::PAID;
    }

    /**
     * Check if transaction is refunded
     */
    public function isRefunded(): bool
    {
        return $this->status === TransactionStatus::REFUNDED;
    }

    /**
     * Check if transaction can be marked as paid
     */
    public function canBeMarkedPaid(): bool
    {
        return $this->status === TransactionStatus::PENDING;
    }

    /**
     * Check if transaction can be refunded
     */
    public function canBeRefunded(): bool
    {
        return $this->status === TransactionStatus::PAID;
    }

    /**
     * Mark transaction as paid
     */
    public function markAsPaid(?string $gatewayTransactionId = null, ?array $gatewayResponse = null): void
    {
        $this->update([
            'status' => TransactionStatus::PAID,
            'paid_at' => now(),
            'gateway_transaction_id' => $gatewayTransactionId ?? $this->gateway_transaction_id,
            'gateway_response' => $gatewayResponse ?? $this->gateway_response,
        ]);
    }

    /**
     * Mark transaction as failed
     */
    public function markAsFailed(?string $reason = null): void
    {
        $this->update([
            'status' => TransactionStatus::FAILED,
            'failed_at' => now(),
            'failure_reason' => $reason,
        ]);
    }

    /**
     * Process refund
     */
    public function refund(?int $amount = null, ?string $reason = null, ?int $refundedBy = null): void
    {
        $this->update([
            'status' => TransactionStatus::REFUNDED,
            'refunded_at' => now(),
            'refund_amount' => $amount ?? $this->amount,
            'refund_reason' => $reason,
            'refunded_by' => $refundedBy,
        ]);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return $this->status->color();
    }
}
