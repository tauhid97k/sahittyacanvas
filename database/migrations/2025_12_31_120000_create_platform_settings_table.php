<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, json, text
            $table->timestamps();
        });

        // Insert default settings
        DB::table('platform_settings')->insert([
            [
                'key' => 'platform_commission_percentage',
                'value' => '5',
                'type' => 'number',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'seller_rules',
                'value' => json_encode([]),
                'type' => 'json',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'author_rules',
                'value' => json_encode([]),
                'type' => 'json',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'terms_of_service',
                'value' => json_encode([]),
                'type' => 'json',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'privacy_policy',
                'value' => json_encode([]),
                'type' => 'json',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
