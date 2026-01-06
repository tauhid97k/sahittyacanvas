<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupStorage extends Command
{
    protected $signature = 'storage:cleanup {--force : Skip confirmation prompt}';

    protected $description = 'Clean up all files in public storage (useful before migrate:fresh)';

    public function handle(): int
    {
        $disk = Storage::disk('public');
        
        $directories = $disk->directories();
        $files = $disk->files();
        
        $totalDirs = count($directories);
        $totalFiles = count($files);
        
        if ($totalDirs === 0 && $totalFiles === 0) {
            $this->info('Storage is already clean.');
            return Command::SUCCESS;
        }

        $this->info("Found {$totalDirs} directories and {$totalFiles} root files in public storage.");

        if (!$this->option('force') && !$this->confirm('Delete all files?', true)) {
            $this->info('Cancelled.');
            return Command::SUCCESS;
        }

        foreach ($files as $file) {
            $disk->delete($file);
        }

        foreach ($directories as $dir) {
            $disk->deleteDirectory($dir);
        }

        $this->info('Storage cleaned.');

        return Command::SUCCESS;
    }
}
