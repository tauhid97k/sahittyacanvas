<?php

namespace App\Observers;

use App\Models\Post;
use Illuminate\Support\Facades\Cache;

class PostObserver
{
    /**
     * Handle the Post "created" event.
     */
    public function created(Post $post): void
    {
        $this->clearPostCaches();
    }

    /**
     * Handle the Post "updated" event.
     */
    public function updated(Post $post): void
    {
        $this->clearPostCaches();
        
        // Also clear single post cache if it exists
        Cache::forget("post:{$post->slug}");
    }

    /**
     * Handle the Post "deleted" event.
     */
    public function deleted(Post $post): void
    {
        $this->clearPostCaches();
        Cache::forget("post:{$post->slug}");
    }

    /**
     * Handle the Post "restored" event.
     */
    public function restored(Post $post): void
    {
        $this->clearPostCaches();
    }

    /**
     * Clear all post listing caches
     */
    private function clearPostCaches(): void
    {
        // Clear main listings
        Cache::tags(['posts'])->flush();
        
        // Clear category-specific caches
        Cache::tags(['posts-by-category'])->flush();
        
        // Clear author-specific caches
        Cache::tags(['posts-by-author'])->flush();
    }
}
