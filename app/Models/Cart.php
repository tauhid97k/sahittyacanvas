<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user who owns the cart
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get cart items
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get or create cart for user/session
     */
    public static function getOrCreate(?int $userId = null, ?string $sessionId = null): self
    {
        if ($userId) {
            return self::firstOrCreate(['user_id' => $userId]);
        }

        if ($sessionId) {
            return self::firstOrCreate(['session_id' => $sessionId]);
        }

        throw new \InvalidArgumentException('Either user_id or session_id must be provided');
    }

    /**
     * Merge guest cart into user cart
     */
    public function mergeFrom(Cart $guestCart): void
    {
        foreach ($guestCart->items as $guestItem) {
            $existingItem = $this->items()->where('product_id', $guestItem->product_id)->first();

            if ($existingItem) {
                $existingItem->increment('quantity', $guestItem->quantity);
            } else {
                $this->items()->create([
                    'product_id' => $guestItem->product_id,
                    'quantity' => $guestItem->quantity,
                    'unit_price' => $guestItem->unit_price,
                ]);
            }
        }

        $guestCart->delete();
    }

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get subtotal
     */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn($item) => $item->quantity * $item->unit_price);
    }

    /**
     * Get items grouped by seller
     */
    public function getItemsBySellerAttribute(): array
    {
        return $this->items
            ->load('product.user')
            ->groupBy('product.user_id')
            ->toArray();
    }

    /**
     * Check if cart is empty
     */
    public function isEmpty(): bool
    {
        return $this->items->isEmpty();
    }

    /**
     * Clear cart
     */
    public function clear(): void
    {
        $this->items()->delete();
    }
}
