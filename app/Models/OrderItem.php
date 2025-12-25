<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity',
        'unit_price',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'total' => 'integer',
        ];
    }

    // ==================== PRICE ACCESSORS ====================

    /**
     * Get unit price in taka
     */
    public function getUnitPriceInTakaAttribute(): float
    {
        return $this->unit_price / 100;
    }

    /**
     * Get total in taka
     */
    public function getTotalInTakaAttribute(): float
    {
        return $this->total / 100;
    }

    /**
     * Get formatted unit price
     */
    public function getFormattedUnitPriceAttribute(): string
    {
        return '৳' . number_format($this->unit_price_in_taka, 2);
    }

    /**
     * Get formatted total
     */
    public function getFormattedTotalAttribute(): string
    {
        return '৳' . number_format($this->total_in_taka, 2);
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product (may be null if deleted)
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Create from cart item
     */
    public static function createFromCartItem(CartItem $cartItem): array
    {
        return [
            'product_id' => $cartItem->product_id,
            'product_name' => $cartItem->product->name_bn,
            'product_sku' => $cartItem->product->sku,
            'quantity' => $cartItem->quantity,
            'unit_price' => $cartItem->unit_price,
            'total' => $cartItem->quantity * $cartItem->unit_price,
        ];
    }
}
