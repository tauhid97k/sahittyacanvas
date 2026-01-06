<?php

namespace App\Console\Commands;

use App\Models\EditorMedia;
use Illuminate\Console\Command;

class CleanupOrphanEditorMedia extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:cleanup-orphans {--days=7 : Delete orphan media older than this many days} {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up orphan EditorMedia records that were never linked to a post';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("Looking for orphan EditorMedia older than {$days} days...");

        // Find EditorMedia records older than specified days
        $orphans = EditorMedia::where('created_at', '<', now()->subDays($days))->get();

        if ($orphans->isEmpty()) {
            $this->info('No orphan EditorMedia found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$orphans->count()} orphan EditorMedia record(s).");

        if ($dryRun) {
            $this->warn('Dry run mode - no records will be deleted.');
            foreach ($orphans as $orphan) {
                $mediaCount = $orphan->media()->count();
                $this->line("  - ID: {$orphan->id}, User: {$orphan->user_id}, Context: {$orphan->context}, Media: {$mediaCount}, Created: {$orphan->created_at}");
            }
            return Command::SUCCESS;
        }

        $deletedCount = 0;
        $mediaDeletedCount = 0;

        foreach ($orphans as $orphan) {
            $mediaCount = $orphan->media()->count();
            $mediaDeletedCount += $mediaCount;
            
            // This will also delete associated media files via Spatie
            $orphan->clearMediaCollection('images');
            $orphan->delete();
            
            $deletedCount++;
        }

        $this->info("Deleted {$deletedCount} orphan EditorMedia record(s) and {$mediaDeletedCount} media file(s).");

        return Command::SUCCESS;
    }
}
