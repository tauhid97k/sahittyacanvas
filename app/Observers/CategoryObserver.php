<?php

namespace App\Observers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryObserver
{
    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Handle the Category "updated" event.
     */
    public function updated(Category $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Handle the Category "deleted" event.
     */
    public function deleted(Category $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Clear all category caches
     */
    private function clearCategoryCaches(): void
    {
        Cache::tags(['categories'])->flush();
        Cache::tags(['posts'])->flush(); // Also clear posts since category counts changed
    }
}
