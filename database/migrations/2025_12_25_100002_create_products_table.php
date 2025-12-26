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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // The seller
            $table->string('name_bn');
            $table->string('name_en')->nullable();
            $table->string('slug')->unique();
            $table->longText('description');
            $table->unsignedBigInteger('price'); // Store in cents (paisa)
            $table->enum('discount_type', ['percentage', 'flat'])->nullable();
            $table->unsignedInteger('discount_value')->nullable(); // Percentage (0-100) or flat amount in paisa
            $table->unsignedInteger('stock_count')->default(0);
            $table->unsignedInteger('stock_alert_threshold')->default(5);
            $table->string('sku')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('moderation_status', ['auto', 'pending', 'approved', 'rejected'])->default('auto');
            $table->timestamp('moderated_at')->nullable();
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('sales_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index('user_id');
            $table->index('slug');
            $table->index('status');
            $table->index('moderation_status');
            $table->index('price');
            $table->index('stock_count');
            $table->index('published_at');
            $table->index('deleted_at');
            $table->index(['status', 'moderation_status']);
            $table->index(['status', 'published_at']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
