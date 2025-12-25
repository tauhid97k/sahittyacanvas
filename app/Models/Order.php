<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'order_number',
        'user_id',
        'seller_id',
        'subtotal',
        'shipping_cost',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'payment_note',
        'shipping_name',
        'shipping_phone',
        'shipping_email',
        'shipping_address',
        'shipping_city',
        'shipping_area',
        'shipping_postal_code',
        'buyer_notes',
        'tracking_number',
        'shipping_provider',
        'shipped_at',
        'delivered_at',
        'seller_notes',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'shipping_cost' => 'integer',
            'total' => 'integer',
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    // ==================== PRICE ACCESSORS ====================

    /**
     * Get subtotal in taka
     */
    public function getSubtotalInTakaAttribute(): float
    {
        return $this->subtotal / 100;
    }

    /**
     * Get shipping cost in taka
     */
    public function getShippingCostInTakaAttribute(): float
    {
        return $this->shipping_cost / 100;
    }

    /**
     * Get total in taka
     */
    public function getTotalInTakaAttribute(): float
    {
        return $this->total / 100;
    }

    /**
     * Get formatted subtotal
     */
    public function getFormattedSubtotalAttribute(): string
    {
        return '৳' . number_format($this->subtotal_in_taka, 2);
    }

    /**
     * Get formatted shipping cost
     */
    public function getFormattedShippingCostAttribute(): string
    {
        return '৳' . number_format($this->shipping_cost_in_taka, 2);
    }

    /**
     * Get formatted total
     */
    public function getFormattedTotalAttribute(): string
    {
        return '৳' . number_format($this->total_in_taka, 2);
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'payment_status', 'tracking_number', 'shipping_provider'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    /**
     * Generate unique order number
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));
        return "ORD-{$date}-{$random}";
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Pending orders
     */
    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::PENDING);
    }

    /**
     * Scope: Confirmed orders
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', OrderStatus::CONFIRMED);
    }

    /**
     * Scope: Processing orders
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', OrderStatus::PROCESSING);
    }

    /**
     * Scope: Shipped orders
     */
    public function scopeShipped($query)
    {
        return $query->where('status', OrderStatus::SHIPPED);
    }

    /**
     * Scope: Delivered orders
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', OrderStatus::DELIVERED);
    }

    /**
     * Scope: Cancelled orders
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', OrderStatus::CANCELLED);
    }

    /**
     * Scope: Active orders (not cancelled/refunded)
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [OrderStatus::CANCELLED, OrderStatus::REFUNDED]);
    }

    /**
     * Scope: For seller
     */
    public function scopeForSeller($query, int $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Scope: For buyer
     */
    public function scopeForBuyer($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the buyer
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Alias for user - the buyer
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the seller
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get transactions for this order
     */
    public function transactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'transactionable');
    }

    /**
     * Get the latest transaction
     */
    public function latestTransaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable')->latestOfMany();
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if order can be confirmed
     */
    public function canBeConfirmed(): bool
    {
        return $this->status === OrderStatus::PENDING;
    }

    /**
     * Check if order can be processed
     */
    public function canBeProcessed(): bool
    {
        return $this->status === OrderStatus::CONFIRMED;
    }

    /**
     * Check if order can be shipped
     */
    public function canBeShipped(): bool
    {
        return $this->status === OrderStatus::PROCESSING;
    }

    /**
     * Check if order can be delivered
     */
    public function canBeDelivered(): bool
    {
        return $this->status === OrderStatus::SHIPPED;
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [OrderStatus::PENDING, OrderStatus::CONFIRMED]);
    }

    /**
     * Confirm order
     */
    public function confirm(): void
    {
        $this->update(['status' => OrderStatus::CONFIRMED]);
    }

    /**
     * Mark as processing
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => OrderStatus::PROCESSING]);
    }

    /**
     * Mark as shipped
     */
    public function markAsShipped(?string $trackingNumber = null, ?string $shippingProvider = null): void
    {
        $this->update([
            'status' => OrderStatus::SHIPPED,
            'tracking_number' => $trackingNumber,
            'shipping_provider' => $shippingProvider,
            'shipped_at' => now(),
        ]);
    }

    /**
     * Mark as delivered
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => OrderStatus::DELIVERED,
            'delivered_at' => now(),
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(?string $reason = null): void
    {
        $this->update([
            'status' => OrderStatus::CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        // Restore stock
        foreach ($this->items as $item) {
            if ($item->product) {
                $item->product->incrementStock($item->quantity);
            }
        }
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(?string $paymentMethod = null, ?string $paymentNote = null): void
    {
        $this->update([
            'payment_status' => PaymentStatus::PAID,
            'payment_method' => $paymentMethod ?? $this->payment_method,
            'payment_note' => $paymentNote ?? $this->payment_note,
        ]);
    }

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    /**
     * Get payment status label
     */
    public function getPaymentStatusLabelAttribute(): string
    {
        return $this->payment_status->label();
    }
}
