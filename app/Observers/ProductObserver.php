<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        $this->clearProductCaches();
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $this->clearProductCaches();
        
        // Also clear single product cache if it exists
        Cache::forget("product:{$product->slug}");
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        $this->clearProductCaches();
        Cache::forget("product:{$product->slug}");
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        $this->clearProductCaches();
    }

    /**
     * Clear all product listing caches
     */
    private function clearProductCaches(): void
    {
        // Clear main listings
        Cache::tags(['products'])->flush();
        
        // Clear category-specific caches
        Cache::tags(['products-by-category'])->flush();
        
        // Clear seller-specific caches
        Cache::tags(['products-by-seller'])->flush();
    }
}
