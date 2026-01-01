<?php

namespace App\Console\Commands;

use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate the sitemap for the website';

    public function handle(): int
    {
        $this->info('Generating sitemap...');

        $sitemap = Sitemap::create();

        // Static pages
        $sitemap->add(Url::create('/')->setPriority(1.0)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        $sitemap->add(Url::create('/posts')->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        $sitemap->add(Url::create('/authors')->setPriority(0.8)->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        $sitemap->add(Url::create('/shop')->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        $sitemap->add(Url::create('/about')->setPriority(0.5)->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        $sitemap->add(Url::create('/contact')->setPriority(0.5)->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        $sitemap->add(Url::create('/terms')->setPriority(0.3)->setChangeFrequency(Url::CHANGE_FREQUENCY_YEARLY));
        $sitemap->add(Url::create('/privacy')->setPriority(0.3)->setChangeFrequency(Url::CHANGE_FREQUENCY_YEARLY));

        // Blog posts
        $this->info('Adding blog posts...');
        Post::published()->each(function (Post $post) use ($sitemap) {
            $sitemap->add(
                Url::create("/post/{$post->slug}")
                    ->setLastModificationDate($post->updated_at)
                    ->setPriority(0.8)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        });

        // Blog categories
        $this->info('Adding blog categories...');
        Category::active()->each(function (Category $category) use ($sitemap) {
            $sitemap->add(
                Url::create("/category/{$category->slug}")
                    ->setPriority(0.7)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        });

        // Authors
        $this->info('Adding authors...');
        Author::active()->each(function (Author $author) use ($sitemap) {
            $sitemap->add(
                Url::create("/author/{$author->slug}")
                    ->setLastModificationDate($author->updated_at)
                    ->setPriority(0.7)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        });

        // Products
        $this->info('Adding products...');
        Product::approved()->whereNotNull('published_at')->each(function (Product $product) use ($sitemap) {
            $sitemap->add(
                Url::create("/product/{$product->slug}")
                    ->setLastModificationDate($product->updated_at)
                    ->setPriority(0.8)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        });

        // Product categories
        $this->info('Adding product categories...');
        ProductCategory::active()->each(function (ProductCategory $category) use ($sitemap) {
            $sitemap->add(
                Url::create("/product-category/{$category->slug}")
                    ->setPriority(0.7)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            );
        });

        // User profiles (public)
        $this->info('Adding user profiles...');
        User::whereHas('posts', fn ($q) => $q->published())
            ->orWhereHas('products', fn ($q) => $q->approved()->whereNotNull('published_at'))
            ->each(function (User $user) use ($sitemap) {
                $sitemap->add(
                    Url::create("/@{$user->username}")
                        ->setPriority(0.6)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                );
            });

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('Sitemap generated successfully at public/sitemap.xml');

        return Command::SUCCESS;
    }
}
