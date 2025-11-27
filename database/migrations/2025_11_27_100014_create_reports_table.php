<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Polymorphic reports table - users can report:
     * - Posts (App\Models\Post)
     * - Comments (App\Models\Comment)
     * - Users (App\Models\User)
     * - Authors (App\Models\Author)
     * - Website (general issues)
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('reportable');
            $table->enum('report_type', ['spam', 'inappropriate', 'copyright', 'harassment', 'misinformation', 'other']);
            $table->text('reason');
            $table->enum('status', ['pending', 'reviewing', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            // Note: morphs() already creates index on (reportable_type, reportable_id)
            $table->index('status');
            $table->index('reporter_id');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
