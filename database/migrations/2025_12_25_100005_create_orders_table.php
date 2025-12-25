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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // ORD-YYYYMMDD-XXXXX
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // The buyer
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete(); // The seller

            // Pricing (stored in cents/paisa)
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_cost')->default(0);
            $table->unsignedBigInteger('total');

            // Status
            $table->enum('status', [
                'pending',      // Order placed, awaiting seller confirmation
                'confirmed',    // Seller accepted the order
                'processing',   // Packaging/preparing
                'shipped',      // Handed to courier
                'delivered',    // Seller marks delivered
                'cancelled',    // Order cancelled
                'refunded',     // Money returned
            ])->default('pending');

            // Payment
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->string('payment_method')->nullable(); // bKash, Nagad, Bank, COD, etc.
            $table->text('payment_note')->nullable(); // Transaction ID, etc.

            // Shipping Info (collected from buyer at checkout)
            $table->string('shipping_name');
            $table->string('shipping_phone');
            $table->string('shipping_email')->nullable();
            $table->text('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_area')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->text('buyer_notes')->nullable();

            // Fulfillment Info (filled by seller)
            $table->string('tracking_number')->nullable();
            $table->string('shipping_provider')->nullable(); // Pathao, Steadfast, Sundarban, etc.
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('seller_notes')->nullable(); // Internal notes

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index('order_number');
            $table->index('user_id');
            $table->index('seller_id');
            $table->index('status');
            $table->index('payment_status');
            $table->index(['seller_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // Product might be deleted
            $table->string('product_name'); // Snapshot
            $table->string('product_sku')->nullable(); // Snapshot
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price'); // Snapshot in cents
            $table->unsignedBigInteger('total'); // In cents
            $table->timestamps();

            // Performance indexes
            $table->index('order_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
