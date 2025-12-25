<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the cart
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get line total
     */
    public function getTotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Update quantity
     */
    public function updateQuantity(int $quantity): void
    {
        if ($quantity <= 0) {
            $this->delete();
            return;
        }

        $this->update(['quantity' => $quantity]);
    }

    /**
     * Increment quantity
     */
    public function incrementQuantity(int $amount = 1): void
    {
        $this->increment('quantity', $amount);
    }

    /**
     * Decrement quantity
     */
    public function decrementQuantity(int $amount = 1): void
    {
        $newQuantity = $this->quantity - $amount;

        if ($newQuantity <= 0) {
            $this->delete();
            return;
        }

        $this->decrement('quantity', $amount);
    }
}
