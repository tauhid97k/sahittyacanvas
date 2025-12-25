<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique(); // TXN-YYYYMMDD-XXXXX

            // Polymorphic relation - can be Order, AdService, Subscription, etc.
            $table->morphs('transactionable'); // transactionable_type, transactionable_id

            // Users involved
            $table->foreignId('payer_id')->constrained('users')->cascadeOnDelete(); // Who pays (buyer)
            $table->foreignId('payee_id')->constrained('users')->cascadeOnDelete(); // Who receives (seller)

            // Payment method
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();

            // Amount (stored in cents/paisa)
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('BDT');

            // Status
            $table->enum('status', ['pending', 'paid', 'refunded', 'failed'])->default('pending');

            // Payment details
            $table->string('gateway_transaction_id')->nullable(); // bKash/Nagad transaction ID
            $table->json('gateway_response')->nullable(); // Full response from payment gateway
            $table->text('note')->nullable(); // Admin/seller notes

            // Timestamps for status changes
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();

            // Refund details
            $table->unsignedBigInteger('refund_amount')->nullable();
            $table->text('refund_reason')->nullable();
            $table->foreignId('refunded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // Performance indexes (morphs already creates transactionable index)
            $table->index('transaction_number');
            $table->index('status');
            $table->index(['payee_id', 'status']); // Seller's transactions by status
            $table->index(['payer_id', 'status']); // Buyer's transactions by status
            $table->index('created_at');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
