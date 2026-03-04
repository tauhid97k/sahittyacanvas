<?php

namespace App\Services\PaymentGateway;

use InvalidArgumentException;

/**
 * Factory/manager for payment gateway instances.
 * 
 * Usage:
 *   $gateway = PaymentGatewayManager::make('bkash');
 *   $result = $gateway->initiate($transaction);
 */
class PaymentGatewayManager
{
    private static array $gateways = [
        'cod' => CodGateway::class,
        'bkash' => BkashGateway::class,
        // Add more gateways here:
        // 'nagad' => NagadGateway::class,
        // 'sslcommerz' => SslCommerzGateway::class,
    ];

    /**
     * Create a payment gateway instance by slug.
     */
    public static function make(string $slug): PaymentGatewayInterface
    {
        if (!isset(self::$gateways[$slug])) {
            throw new InvalidArgumentException("Payment gateway '{$slug}' is not registered.");
        }

        return new self::$gateways[$slug]();
    }

    /**
     * Check if a gateway is registered.
     */
    public static function has(string $slug): bool
    {
        return isset(self::$gateways[$slug]);
    }

    /**
     * Register a new gateway.
     */
    public static function register(string $slug, string $class): void
    {
        self::$gateways[$slug] = $class;
    }

    /**
     * Get all registered gateway slugs.
     */
    public static function available(): array
    {
        return array_keys(self::$gateways);
    }
}
