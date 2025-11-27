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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->text('bio')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('bio');
            $table->string('banner')->nullable()->after('avatar');
            $table->boolean('is_verified')->default(false)->after('email_verified_at');
            $table->integer('reputation_score')->default(0)->after('is_verified');
            $table->unsignedInteger('posts_count')->default(0)->after('reputation_score');
            $table->unsignedInteger('followers_count')->default(0)->after('posts_count');
            $table->unsignedInteger('following_count')->default(0)->after('followers_count');

            $table->index('username');
            $table->index('is_verified');
            $table->index('reputation_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['username']);
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['reputation_score']);

            $table->dropColumn([
                'username',
                'bio',
                'avatar',
                'banner',
                'is_verified',
                'reputation_score',
                'posts_count',
                'followers_count',
                'following_count',
            ]);
        });
    }
};
