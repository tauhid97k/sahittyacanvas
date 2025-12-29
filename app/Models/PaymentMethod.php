<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class PaymentMethod extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'description',
        'instructions',
        'config',
        'icon',
        'is_active',
        'is_cod',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'encrypted:array',
            'is_active' => 'boolean',
            'is_cod' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // ==================== SCOPES ====================

    /**
     * Scope: Active payment methods
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: COD methods
     */
    public function scopeCod($query)
    {
        return $query->where('is_cod', true);
    }

    /**
     * Scope: Online payment methods (not COD)
     */
    public function scopeOnline($query)
    {
        return $query->where('is_cod', false);
    }

    /**
     * Scope: Ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get transactions using this payment method
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if this is Cash on Delivery
     */
    public function isCashOnDelivery(): bool
    {
        return $this->is_cod;
    }

    /**
     * Check if this requires online payment
     */
    public function requiresOnlinePayment(): bool
    {
        return !$this->is_cod;
    }

    /**
     * Get config value
     */
    public function getConfigValue(string $key, mixed $default = null): mixed
    {
        return $this->config[$key] ?? $default;
    }

    // ==================== MEDIA ====================

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('icon')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
    }

    /**
     * Get icon URL
     */
    public function getIconUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('icon') ?: null;
    }
}
