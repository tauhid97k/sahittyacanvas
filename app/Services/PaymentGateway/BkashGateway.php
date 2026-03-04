<?php

namespace App\Services\PaymentGateway;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

/**
 * Stub for bKash payment gateway integration.
 * 
 * To implement:
 * 1. Add BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD to .env
 * 2. Implement the bKash Checkout API (tokenized or URL-based)
 * 3. Handle callback/webhook verification
 * 
 * bKash API docs: https://developer.bka.sh/
 */
class BkashGateway implements PaymentGatewayInterface
{
    public function initiate(Transaction $transaction, array $metadata = []): ?array
    {
        // TODO: Implement bKash Create Payment API
        // 1. Get auth token from bKash
        // 2. Create payment request with amount, invoice number
        // 3. Return redirect URL for customer
        Log::info('bKash payment initiation requested', [
            'transaction_id' => $transaction->id,
            'amount' => $transaction->amount_in_taka,
        ]);

        return [
            'redirect_url' => null, // bKash checkout URL would go here
            'payment_id' => null,
        ];
    }

    public function verify(Transaction $transaction, array $payload = []): bool
    {
        // TODO: Implement bKash Execute Payment + Query Payment APIs
        // 1. Execute the payment using paymentID from callback
        // 2. Verify transaction status and amount
        Log::info('bKash payment verification requested', [
            'transaction_id' => $transaction->id,
            'payload' => $payload,
        ]);

        return false;
    }

    public function refund(Transaction $transaction, int $amountInPaisa, string $reason = ''): bool
    {
        // TODO: Implement bKash Refund API
        Log::info('bKash refund requested', [
            'transaction_id' => $transaction->id,
            'amount' => $amountInPaisa / 100,
            'reason' => $reason,
        ]);

        return false;
    }

    public function getSlug(): string
    {
        return 'bkash';
    }
}
