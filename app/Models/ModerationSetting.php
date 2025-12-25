<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ModerationSetting extends Model
{
    use HasFactory;

    /**
     * Available setting keys
     */
    public const KEYS = [
        'posts_require_approval' => 'Posts require approval before publishing',
        'comments_require_approval' => 'Comments require approval before showing',
        'products_require_approval' => 'Products require approval before publishing',
        'auto_approve_verified_users' => 'Auto-approve content from verified users',
        'max_links_in_comment' => 'Maximum links allowed in comments',
        'spam_filter_enabled' => 'Enable spam filter',
    ];

    protected $fillable = [
        'setting_key',
        'setting_value',
        'description',
    ];

    /**
     * Cache key prefix
     */
    protected const CACHE_PREFIX = 'moderation_setting_';

    /**
     * Cache TTL in seconds (1 hour)
     */
    protected const CACHE_TTL = 3600;

    // ==================== STATIC METHODS ====================

    /**
     * Get a setting value
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        return Cache::remember(
            self::CACHE_PREFIX . $key,
            self::CACHE_TTL,
            fn() => self::where('setting_key', $key)->value('setting_value') ?? $default
        );
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, mixed $value, ?string $description = null): void
    {
        self::updateOrCreate(
            ['setting_key' => $key],
            ['setting_value' => $value, 'description' => $description ?? self::KEYS[$key] ?? null]
        );

        Cache::forget(self::CACHE_PREFIX . $key);
    }

    /**
     * Get all settings as array
     */
    public static function getAllSettings(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . 'all',
            self::CACHE_TTL,
            fn() => self::pluck('setting_value', 'setting_key')->toArray()
        );
    }

    /**
     * Clear all cached settings
     */
    public static function clearCache(): void
    {
        foreach (array_keys(self::KEYS) as $key) {
            Cache::forget(self::CACHE_PREFIX . $key);
        }
        Cache::forget(self::CACHE_PREFIX . 'all');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if posts require approval
     */
    public static function postsRequireApproval(): bool
    {
        return (bool) self::getValue('posts_require_approval', false);
    }

    /**
     * Check if comments require approval
     */
    public static function commentsRequireApproval(): bool
    {
        return (bool) self::getValue('comments_require_approval', false);
    }

    /**
     * Check if products require approval
     */
    public static function productsRequireApproval(): bool
    {
        return (bool) self::getValue('products_require_approval', false);
    }

    /**
     * Check if verified users are auto-approved
     */
    public static function autoApproveVerifiedUsers(): bool
    {
        return (bool) self::getValue('auto_approve_verified_users', true);
    }

    /**
     * Get key label
     */
    public function getKeyLabelAttribute(): string
    {
        return self::KEYS[$this->setting_key] ?? $this->setting_key;
    }

    /**
     * Casts
     */
    protected function casts(): array
    {
        return [
            'setting_value' => 'boolean',
        ];
    }

    // ==================== BOOT ====================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Clear cache on save
        static::saved(function ($setting) {
            self::clearCache();
        });

        // Clear cache on delete
        static::deleted(function ($setting) {
            self::clearCache();
        });
    }
}
