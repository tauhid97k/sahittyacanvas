<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Multi-page support using order-based system:
     * - Uses `order` field instead of sequential page numbers
     * - Soft deletes maintain stable references
     * - Frontend calculates page numbers from sorted order
     * - Fractional ordering allows insertions without cascading updates
     */
    public function up(): void
    {
        Schema::create('post_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->longText('content');
            $table->unsignedInteger('order')->default(10);
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['post_id', 'order']);
            $table->index(['post_id', 'status']);
            $table->unique(['post_id', 'order'], 'unique_post_page_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_pages');
    }
};
