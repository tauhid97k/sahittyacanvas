<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Multi-page support for content continuation:
     * - Page 1 content is in the post itself
     * - Page 2+ content stored here
     * - Order field determines page sequence (2, 3, 4...)
     * - Inherits status/published_at from parent post
     */
    public function up(): void
    {
        Schema::create('post_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->longText('content')->nullable(); // Nullable for auto-creation, required on save
            $table->unsignedInteger('order'); // Page number (2, 3, 4...)
            $table->timestamps();

            $table->index(['post_id', 'order']);
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
