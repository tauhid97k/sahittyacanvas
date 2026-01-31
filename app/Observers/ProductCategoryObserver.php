<?php

namespace App\Observers;

use App\Models\ProductCategory;
use Illuminate\Support\Facades\Cache;

class ProductCategoryObserver
{
    /**
     * Handle the ProductCategory "created" event.
     */
    public function created(ProductCategory $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Handle the ProductCategory "updated" event.
     */
    public function updated(ProductCategory $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Handle the ProductCategory "deleted" event.
     */
    public function deleted(ProductCategory $category): void
    {
        $this->clearCategoryCaches();
    }

    /**
     * Clear all product category caches
     */
    private function clearCategoryCaches(): void
    {
        Cache::tags(['product-categories'])->flush();
        Cache::tags(['products'])->flush(); // Also clear products since category counts changed
    }
}
