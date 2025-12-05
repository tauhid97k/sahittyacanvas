<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Removes chapter-related columns and tables that were removed from the codebase.
     * Chapters can be re-added later if needed.
     */
    public function up(): void
    {
        // Drop the chapters pivot table
        Schema::dropIfExists('post_chapters');

        // Remove chapters_count column from posts
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('chapters_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add chapters_count to posts
        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedInteger('chapters_count')->default(0)->after('pages_count');
        });

        // Re-create post_chapters table
        Schema::create('post_chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_post_id')->constrained('posts')->cascadeOnDelete();
            $table->foreignId('chapter_post_id')->constrained('posts')->cascadeOnDelete();
            $table->unsignedInteger('order');
            $table->timestamps();

            $table->unique(['parent_post_id', 'chapter_post_id']);
            $table->unique(['parent_post_id', 'order']);
            $table->index('chapter_post_id');
        });
    }
};
