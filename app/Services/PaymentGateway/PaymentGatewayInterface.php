<?php

namespace App\Services\PaymentGateway;

use App\Models\Transaction;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment for the given transaction.
     * Returns an array with 'redirect_url' for online payments or null for COD.
     */
    public function initiate(Transaction $transaction, array $metadata = []): ?array;

    /**
     * Verify a payment callback/webhook from the gateway.
     * Returns true if payment is verified as successful.
     */
    public function verify(Transaction $transaction, array $payload = []): bool;

    /**
     * Process a refund for the given transaction.
     * Returns true if refund was initiated successfully.
     */
    public function refund(Transaction $transaction, int $amountInPaisa, string $reason = ''): bool;

    /**
     * Get the gateway identifier slug (e.g., 'bkash', 'nagad', 'cod').
     */
    public function getSlug(): string;
}
