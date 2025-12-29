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
                'name_bn' => 'প্রিমিয়াম কটন শার্ট',
                'name_en' => 'Premium Cotton Shirt',
                'description' => '<p>High quality premium cotton shirt for men. Comfortable and stylish.</p>',
                'price' => 150000, // 1500 taka in paisa
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'stock_count' => 50,
                'stock_alert_threshold' => 10,
            ],
            [
                'name_bn' => 'ক্যাজুয়াল ডেনিম প্যান্ট',
                'name_en' => 'Casual Denim Pants',
                'description' => '<p>Comfortable casual denim pants. Perfect for everyday wear.</p>',
                'price' => 200000, // 2000 taka
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 30,
                'stock_alert_threshold' => 5,
            ],
            [
                'name_bn' => 'স্মার্টফোন কেস',
                'name_en' => 'Smartphone Case',
                'description' => '<p>Durable smartphone case with premium finish.</p>',
                'price' => 50000, // 500 taka
                'discount_type' => 'flat',
                'discount_value' => 5000, // 50 taka discount
                'stock_count' => 100,
                'stock_alert_threshold' => 20,
            ],
            [
                'name_bn' => 'ওয়্যারলেস ইয়ারবাড',
                'name_en' => 'Wireless Earbuds',
                'description' => '<p>High quality wireless earbuds with noise cancellation.</p>',
                'price' => 350000, // 3500 taka
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'stock_count' => 25,
                'stock_alert_threshold' => 5,
            ],
            [
                'name_bn' => 'বাংলা উপন্যাস সংকলন',
                'name_en' => 'Bengali Novel Collection',
                'description' => '<p>Collection of classic Bengali novels.</p>',
                'price' => 80000, // 800 taka
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 40,
                'stock_alert_threshold' => 10,
            ],
            [
                'name_bn' => 'সিল্ক শাড়ি',
                'name_en' => 'Silk Saree',
                'description' => '<p>Beautiful silk saree with traditional design.</p>',
                'price' => 500000, // 5000 taka
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'stock_count' => 15,
                'stock_alert_threshold' => 3,
            ],
            [
                'name_bn' => 'স্টেইনলেস স্টিল ওয়াটার বটল',
                'name_en' => 'Stainless Steel Water Bottle',
                'description' => '<p>Eco-friendly stainless steel water bottle.</p>',
                'price' => 45000, // 450 taka
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 80,
                'stock_alert_threshold' => 15,
            ],
            [
                'name_bn' => 'লেদার ওয়ালেট',
                'name_en' => 'Leather Wallet',
                'description' => '<p>Genuine leather wallet with multiple card slots.</p>',
                'price' => 120000, // 1200 taka
                'discount_type' => 'flat',
                'discount_value' => 10000, // 100 taka discount
                'stock_count' => 35,
                'stock_alert_threshold' => 8,
            ],
            [
                'name_bn' => 'স্পোর্টস শু',
                'name_en' => 'Sports Shoes',
                'description' => '<p>Comfortable sports shoes for running and gym.</p>',
                'price' => 280000, // 2800 taka
                'discount_type' => 'percentage',
                'discount_value' => 25,
                'stock_count' => 20,
                'stock_alert_threshold' => 5,
            ],
            [
                'name_bn' => 'ব্লুটুথ স্পিকার',
                'name_en' => 'Bluetooth Speaker',
                'description' => '<p>Portable bluetooth speaker with powerful bass.</p>',
                'price' => 180000, // 1800 taka
                'discount_type' => null,
                'discount_value' => null,
                'stock_count' => 45,
                'stock_alert_threshold' => 10,
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

            // Attach to category
            $product->categories()->attach($category->id);
        }

        $this->command->info('Created ' . count($products) . ' products.');
    }
}
