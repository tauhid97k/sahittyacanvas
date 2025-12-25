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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // bKash, Nagad, Bank Transfer, Cash on Delivery
            $table->string('slug')->unique(); // bkash, nagad, bank, cod
            $table->string('type'); // mobile_banking, bank, cod
            $table->text('description')->nullable();
            $table->text('instructions')->nullable(); // Payment instructions for buyers
            $table->json('config')->nullable(); // API keys, account numbers, etc. (encrypted)
            $table->string('icon')->nullable(); // Icon class or URL
            $table->boolean('is_active')->default(true);
            $table->boolean('is_cod')->default(false); // Cash on Delivery flag
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            // Performance indexes
            $table->index('is_active');
            $table->index('type');
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
