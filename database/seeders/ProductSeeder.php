<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if products already exist
        if (Product::count() > 0) {
            $this->command->info('Products already exist. Skipping...');
            return;
        }

        // Get sellers (users with seller role)
        $sellers = User::role('seller')->get();
        
        if ($sellers->isEmpty()) {
            // Create a seller if none exists
            $seller = User::factory()->create([
                'name' => 'Demo Seller',
                'email' => 'seller@example.com',
                'username' => 'demoseller',
            ]);
            $seller->assignRole('seller');
            $sellers = collect([$seller]);
        }

        $categories = ProductCategory::whereNotNull('parent_id')->get();
        
        if ($categories->isEmpty()) {
            $this->command->warn('No product categories found. Please run ProductCategorySeeder first.');
            return;
        }

        $products = [
            [
                'name_bn' => 'গীতাঞ্জলি - রবীন্দ্রনাথ ঠাকুর',
                'name_en' => 'Gitanjali - Rabindranath Tagore',
                'description' => '<p>নোবেল পুরস্কার বিজয়ী কাব্যগ্রন্থ। বাংলা সাহিত্যের অমূল্য সম্পদ।</p>',
                'price' => 35000,
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'stock_count' => 50,
                'stock_alert_threshold' => 10,
                'image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'বিদ্রোহী - কাজী নজরুল ইসলাম',
                'name_en' => 'Bidrohi - Kazi Nazrul Islam',
                'description' => '<p>বাংলাদেশের জাতীয় কবির বিখ্যাত কবিতা সংকলন।</p>',
                'price' => 28000,
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 30,
                'stock_alert_threshold' => 5,
                'image' => 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'পথের পাঁচালী - বিভূতিভূষণ বন্দ্যোপাধ্যায়',
                'name_en' => 'Pather Panchali',
                'description' => '<p>বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ উপন্যাস।</p>',
                'price' => 42000,
                'discount_type' => 'flat',
                'discount_value' => 5000,
                'stock_count' => 100,
                'stock_alert_threshold' => 20,
                'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'দেবদাস - শরৎচন্দ্র চট্টোপাধ্যায়',
                'name_en' => 'Devdas - Sarat Chandra',
                'description' => '<p>বাংলা সাহিত্যের চিরায়ত প্রেমের উপন্যাস।</p>',
                'price' => 38000,
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'stock_count' => 25,
                'stock_alert_threshold' => 5,
                'image' => 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'বাংলা কবিতা সংকলন',
                'name_en' => 'Bengali Poetry Collection',
                'description' => '<p>বাংলা কবিতার সেরা সংকলন।</p>',
                'price' => 55000,
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 40,
                'stock_alert_threshold' => 10,
                'image' => 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'শেষের কবিতা - রবীন্দ্রনাথ',
                'name_en' => 'Shesher Kobita',
                'description' => '<p>রবীন্দ্রনাথের বিখ্যাত উপন্যাস।</p>',
                'price' => 32000,
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'stock_count' => 15,
                'stock_alert_threshold' => 3,
                'image' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'চোখের বালি',
                'name_en' => 'Chokher Bali',
                'description' => '<p>রবীন্দ্রনাথ ঠাকুরের সামাজিক উপন্যাস।</p>',
                'price' => 45000,
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 80,
                'stock_alert_threshold' => 15,
                'image' => 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'ফেলুদা সমগ্র',
                'name_en' => 'Feluda Samagra',
                'description' => '<p>সত্যজিৎ রায়ের বিখ্যাত গোয়েন্দা সিরিজ।</p>',
                'price' => 85000,
                'discount_type' => 'flat',
                'discount_value' => 10000,
                'stock_count' => 35,
                'stock_alert_threshold' => 8,
                'image' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            ],
        ];

        foreach ($products as $index => $productData) {
            $seller = $sellers->random();
            $category = $categories->random();
            
            $slug = Str::slug($productData['name_en'] ?? $productData['name_bn']);
            $counter = 1;
            $originalSlug = $slug;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            $imageUrl = $productData['image'] ?? null;
            unset($productData['image']);

            $product = Product::create([
                'user_id' => $seller->id,
                'name_bn' => $productData['name_bn'],
                'name_en' => $productData['name_en'],
                'slug' => $slug,
                'description' => $productData['description'],
                'price' => $productData['price'],
                'discount_type' => $productData['discount_type'],
                'discount_value' => $productData['discount_value'],
                'stock_count' => $productData['stock_count'],
                'stock_alert_threshold' => $productData['stock_alert_threshold'],
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'status' => 'published',
                'moderation_status' => 'approved',
                'moderated_at' => now(),
                'published_at' => now()->subDays(rand(1, 30)),
                'sales_count' => rand(0, 100),
                'views_count' => rand(50, 500),
            ]);

            // Add image from URL
            if ($imageUrl) {
                $product->addMediaFromUrl($imageUrl)->toMediaCollection('images');
            }

            // Attach to category
            $product->categories()->attach($category->id);
        }

        $this->command->info('Created ' . count($products) . ' products.');
    }
}
