<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case REFUNDED = 'refunded';
    case FAILED = 'failed';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::REFUNDED => 'Refunded',
            self::FAILED => 'Failed',
        };
    }

    /**
     * Get color for UI
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::PAID => 'green',
            self::REFUNDED => 'blue',
            self::FAILED => 'red',
        };
    }

    /**
     * Check if transaction is successful
     */
    public function isSuccessful(): bool
    {
        return $this === self::PAID;
    }

    /**
     * Check if transaction can be refunded
     */
    public function canBeRefunded(): bool
    {
        return $this === self::PAID;
    }
}
