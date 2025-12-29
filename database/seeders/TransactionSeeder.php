<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\TransactionStatus;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if transactions already exist
        if (Transaction::count() > 0) {
            $this->command->info('Transactions already exist. Skipping...');
            return;
        }

        // Get paid orders
        $paidOrders = Order::where('payment_status', PaymentStatus::PAID)->get();

        if ($paidOrders->isEmpty()) {
            $this->command->warn('No paid orders found. Please run OrderSeeder first.');
            return;
        }

        $paymentMethods = PaymentMethod::where('is_active', true)->get();
        
        if ($paymentMethods->isEmpty()) {
            $this->command->warn('No payment methods found. Please run PaymentMethodSeeder first.');
            return;
        }

        $transactionCount = 0;

        foreach ($paidOrders as $order) {
            // Check if transaction already exists for this order
            $exists = Transaction::where('transactionable_type', Order::class)
                ->where('transactionable_id', $order->id)
                ->exists();

            if ($exists) {
                continue;
            }

            $paymentMethod = $paymentMethods->random();

            Transaction::create([
                'transaction_number' => 'TXN-' . strtoupper(uniqid()),
                'transactionable_type' => Order::class,
                'transactionable_id' => $order->id,
                'payer_id' => $order->user_id,
                'payee_id' => $order->seller_id,
                'payment_method_id' => $paymentMethod->id,
                'amount' => $order->total,
                'currency' => 'BDT',
                'status' => TransactionStatus::PAID,
                'gateway_transaction_id' => 'GW-' . strtoupper(uniqid()),
                'note' => 'Payment for order ' . $order->order_number,
                'paid_at' => $order->created_at->addMinutes(rand(5, 60)),
                'created_at' => $order->created_at,
            ]);

            $transactionCount++;
        }

        $this->command->info("Created $transactionCount transactions.");
    }
}
