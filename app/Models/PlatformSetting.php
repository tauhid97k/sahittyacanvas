<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    // Setting keys
    public const PLATFORM_COMMISSION_PERCENTAGE = 'platform_commission_percentage';
    public const SELLER_RULES = 'seller_rules';
    public const AUTHOR_RULES = 'author_rules';
    public const TERMS_OF_SERVICE = 'terms_of_service';
    public const PRIVACY_POLICY = 'privacy_policy';

    public const KEYS = [
        self::PLATFORM_COMMISSION_PERCENTAGE,
        self::SELLER_RULES,
        self::AUTHOR_RULES,
        self::TERMS_OF_SERVICE,
        self::PRIVACY_POLICY,
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = Cache::remember("platform_setting_{$key}", 3600, function () use ($key) {
            return self::where('key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'number' => (float) $setting->value,
            'json' => json_decode($setting->value, true) ?? [],
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            default => $setting->value,
        };
    }

    /**
     * Set a setting value by key
     */
    public static function setValue(string $key, mixed $value, ?string $type = null): void
    {
        $setting = self::firstOrNew(['key' => $key]);

        if ($type) {
            $setting->type = $type;
        }

        $setting->value = match ($setting->type ?? $type ?? 'string') {
            'json' => is_string($value) ? $value : json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };

        $setting->save();

        Cache::forget("platform_setting_{$key}");
    }

    /**
     * Get platform commission percentage
     */
    public static function getCommissionPercentage(): float
    {
        return (float) self::getValue(self::PLATFORM_COMMISSION_PERCENTAGE, 5);
    }

    /**
     * Set platform commission percentage
     */
    public static function setCommissionPercentage(float $percentage): void
    {
        self::setValue(self::PLATFORM_COMMISSION_PERCENTAGE, $percentage, 'number');
    }

    /**
     * Get seller rules
     */
    public static function getSellerRules(): array
    {
        return self::getValue(self::SELLER_RULES, []);
    }

    /**
     * Get author rules
     */
    public static function getAuthorRules(): array
    {
        return self::getValue(self::AUTHOR_RULES, []);
    }

    /**
     * Get terms of service
     */
    public static function getTermsOfService(): array
    {
        return self::getValue(self::TERMS_OF_SERVICE, []);
    }

    /**
     * Get privacy policy
     */
    public static function getPrivacyPolicy(): array
    {
        return self::getValue(self::PRIVACY_POLICY, []);
    }
}
