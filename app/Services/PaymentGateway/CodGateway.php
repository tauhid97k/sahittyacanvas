<?php

namespace App\Services\PaymentGateway;

use App\Models\Transaction;

class CodGateway implements PaymentGatewayInterface
{
    public function initiate(Transaction $transaction, array $metadata = []): ?array
    {
        // COD doesn't require online payment initiation
        // Payment is collected upon delivery
        return null;
    }

    public function verify(Transaction $transaction, array $payload = []): bool
    {
        // COD payments are verified manually by the seller
        return true;
    }

    public function refund(Transaction $transaction, int $amountInPaisa, string $reason = ''): bool
    {
        // COD refunds are handled manually
        return true;
    }

    public function getSlug(): string
    {
        return 'cod';
    }
}
