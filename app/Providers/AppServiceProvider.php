<?php

namespace App\Providers;

use App\Enums\Role;
use App\Http\Responses\LoginResponse;
use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Observers\CategoryObserver;
use App\Observers\PostObserver;
use App\Observers\ProductCategoryObserver;
use App\Observers\ProductObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Custom login response to handle modal login (stay on same page)
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Gate::before(function ($user) {
            return $user->hasRole(Role::SUPER) ? true : null;
        });

        // Register model observers for cache invalidation
        Post::observe(PostObserver::class);
        Product::observe(ProductObserver::class);
        Category::observe(CategoryObserver::class);
        ProductCategory::observe(ProductCategoryObserver::class);
    }
}
