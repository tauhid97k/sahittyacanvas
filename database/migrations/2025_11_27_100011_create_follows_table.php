<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Polymorphic follows table - users can follow:
     * - Other users (App\Models\User)
     * - Famous authors (App\Models\Author)
     * 
     * Twitter-like notification system:
     * - Follow a user and toggle notification preferences per follow
     * - When followed user posts anything new, followers get notified
     */
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('followable');
            
            // Notification preferences for this follow
            $table->boolean('notify_new_posts')->default(true);
            $table->boolean('notify_via_email')->default(false);
            $table->boolean('notify_via_push')->default(true);
            
            $table->timestamps();

            $table->unique(['follower_id', 'followable_type', 'followable_id'], 'unique_follow');
            // Note: morphs() already creates index on (followable_type, followable_id)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
