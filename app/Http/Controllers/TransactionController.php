<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display seller's transactions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = Transaction::query()
            ->select([
                'id', 'transaction_number', 'transactionable_type', 'transactionable_id',
                'payer_id', 'payment_method_id', 'amount', 'currency', 'status',
                'gateway_transaction_id', 'paid_at', 'created_at'
            ])
            ->with([
                'payer:id,name,email',
                'paymentMethod:id,name,slug,icon',
                'transactionable',
            ])
            ->where('payee_id', $user->id)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_number', 'like', "%{$search}%")
                      ->orWhere('gateway_transaction_id', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->get('status'));
            })
            ->when($request->filled('payment_method'), function ($query) use ($request) {
                $query->where('payment_method_id', $request->get('payment_method'));
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform with computed attributes
        $transactions->through(function ($transaction) {
            $transaction->amount_in_taka = $transaction->amount_in_taka;
            $transaction->formatted_amount = $transaction->formatted_amount;
            $transaction->status_label = $transaction->status_label;
            $transaction->status_color = $transaction->status_color;

            // Add transactionable info
            if ($transaction->transactionable) {
                $transaction->transactionable_info = match ($transaction->transactionable_type) {
                    'App\\Models\\Order' => [
                        'type' => 'order',
                        'number' => $transaction->transactionable->order_number,
                        'route' => route('seller.orders.show', $transaction->transactionable),
                    ],
                    default => [
                        'type' => 'unknown',
                        'number' => $transaction->transactionable_id,
                        'route' => null,
                    ],
                };
            }

            return $transaction;
        });

        // Get counts for tabs
        $counts = [
            'all' => Transaction::where('payee_id', $user->id)->count(),
            'pending' => Transaction::where('payee_id', $user->id)->pending()->count(),
            'paid' => Transaction::where('payee_id', $user->id)->paid()->count(),
            'refunded' => Transaction::where('payee_id', $user->id)->refunded()->count(),
        ];

        return Inertia::render('dashboard/transactions/index', [
            'transactions' => $transactions,
            'counts' => $counts,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'payment_method' => $request->get('payment_method', ''),
            ],
            'statuses' => collect(TransactionStatus::cases())->map(fn($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
        ]);
    }

    /**
     * Display transaction details.
     */
    public function show(Transaction $transaction): Response
    {
        // Ensure user is the payee (seller)
        if ($transaction->payee_id !== auth()->id()) {
            abort(403);
        }

        $transaction->load([
            'payer:id,name,email',
            'paymentMethod',
            'transactionable',
            'refundedByUser:id,name',
        ]);

        // Add computed attributes
        $transaction->amount_in_taka = $transaction->amount_in_taka;
        $transaction->formatted_amount = $transaction->formatted_amount;
        $transaction->status_label = $transaction->status_label;
        $transaction->status_color = $transaction->status_color;

        if ($transaction->refund_amount) {
            $transaction->refund_amount_in_taka = $transaction->refund_amount_in_taka;
            $transaction->formatted_refund_amount = $transaction->formatted_refund_amount;
        }

        return Inertia::render('dashboard/transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Mark transaction as paid (for COD orders).
     */
    public function markPaid(Request $request, Transaction $transaction): RedirectResponse
    {
        // Ensure user is the payee (seller)
        if ($transaction->payee_id !== auth()->id()) {
            abort(403);
        }

        if (!$transaction->canBeMarkedPaid()) {
            return back()->with('error', 'এই লেনদেন পরিশোধিত হিসেবে চিহ্নিত করা যাবে না।');
        }

        $request->validate([
            'gateway_transaction_id' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $transaction->markAsPaid(
            $request->gateway_transaction_id,
            $request->gateway_response ? ['manual_note' => $request->note] : null
        );

        // Also update the order's payment status if transactionable is an Order
        if ($transaction->transactionable_type === 'App\\Models\\Order') {
            $transaction->transactionable->update([
                'payment_status' => 'paid',
                'payment_note' => $request->note,
            ]);
        }

        return back()->with('success', 'লেনদেন পরিশোধিত হিসেবে চিহ্নিত হয়েছে।');
    }

    /**
     * Process refund.
     */
    public function refund(Request $request, Transaction $transaction): RedirectResponse
    {
        // Ensure user is the payee (seller)
        if ($transaction->payee_id !== auth()->id()) {
            abort(403);
        }

        if (!$transaction->canBeRefunded()) {
            return back()->with('error', 'এই লেনদেন ফেরত দেওয়া যাবে না।');
        }

        $request->validate([
            'refund_amount' => ['nullable', 'numeric', 'min:0', 'max:' . $transaction->amount_in_taka],
            'refund_reason' => ['required', 'string', 'max:500'],
        ]);

        $refundAmount = $request->refund_amount
            ? (int) round($request->refund_amount * 100)
            : $transaction->amount;

        $transaction->refund($refundAmount, $request->refund_reason, auth()->id());

        // Also update the order's payment status if transactionable is an Order
        if ($transaction->transactionable_type === 'App\\Models\\Order') {
            $transaction->transactionable->update([
                'payment_status' => 'refunded',
            ]);
        }

        return back()->with('success', 'লেনদেন ফেরত দেওয়া হয়েছে।');
    }
}
