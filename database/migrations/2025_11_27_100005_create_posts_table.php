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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('authors')->nullOnDelete();
            $table->string('title_bn'); // Can be duplicate for series posts
            $table->string('title_en')->unique(); // Must be unique for clean SEO slugs
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content'); // Page 1 content (main content)
            $table->string('meta_description', 160)->nullable();
            $table->string('featured_image')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->enum('moderation_status', ['auto', 'pending', 'approved', 'rejected'])->default('auto');
            $table->timestamp('moderated_at')->nullable();
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            // views_count handled by Laravisit package (coderflexx/laravisit)
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('bookmarks_count')->default(0);
            $table->unsignedInteger('pages_count')->default(0); // Extra pages (page 2+)
            // SEO handled by ralphjsmit/laravel-seo package (polymorphic seo table)
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index('status');
            $table->index('published_at');
            $table->index('deleted_at');
            $table->index('likes_count');
            $table->index('comments_count');
            $table->index('moderation_status');
            $table->index(['status', 'published_at']);
            $table->index(['status', 'published_at', 'created_at']);
            $table->index(['status', 'moderation_status']);
            $table->index(['user_id', 'status']);
            $table->index(['author_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
