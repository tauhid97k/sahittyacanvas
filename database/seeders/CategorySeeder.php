<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing categories
        Category::query()->delete();

        // Main categories (parent categories) with Unsplash images
        $mainCategories = [
            [
                'name_bn' => 'কবিতা',
                'name_en' => 'Poetry',
                'description' => 'বাংলা ও বিশ্ব সাহিত্যের কবিতা সংকলন',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'গল্প',
                'name_en' => 'Short Stories',
                'description' => 'ছোটগল্প ও উপন্যাসিকা',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'উপন্যাস',
                'name_en' => 'Novels',
                'description' => 'বাংলা ও অনূদিত উপন্যাস',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'প্রবন্ধ',
                'name_en' => 'Essays',
                'description' => 'সাহিত্য ও সমাজ বিষয়ক প্রবন্ধ',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'নাটক',
                'name_en' => 'Drama',
                'description' => 'মঞ্চ নাটক ও নাট্য সাহিত্য',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=400&fit=crop',
            ],
            [
                'name_bn' => 'ছড়া',
                'name_en' => 'Rhymes',
                'description' => 'শিশুতোষ ছড়া ও কিশোর সাহিত্য',
                'is_active' => true,
                'image_url' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
            ],
        ];

        $createdParents = [];

        foreach ($mainCategories as $categoryData) {
            $imageUrl = $categoryData['image_url'] ?? null;
            unset($categoryData['image_url']);

            $category = Category::create([
                ...$categoryData,
                'slug' => Str::slug($categoryData['name_en']),
            ]);

            // Add image using Spatie MediaLibrary
            if ($imageUrl) {
                try {
                    $category->addMediaFromUrl($imageUrl)->toMediaCollection('image');
                } catch (\Exception $e) {
                    $this->command->warn("Could not add image for category: {$category->name_bn}");
                }
            }

            $createdParents[$categoryData['name_en']] = $category;
        }

        // Sub-categories
        $subCategories = [
            // Poetry sub-categories
            [
                'name_bn' => 'প্রেমের কবিতা',
                'name_en' => 'Love Poetry',
                'description' => 'প্রেম ও ভালোবাসার কবিতা',
                'parent' => 'Poetry',
                'is_active' => true,
            ],
            [
                'name_bn' => 'দেশাত্মবোধক কবিতা',
                'name_en' => 'Patriotic Poetry',
                'description' => 'দেশপ্রেম ও স্বাধীনতার কবিতা',
                'parent' => 'Poetry',
                'is_active' => true,
            ],
            [
                'name_bn' => 'প্রকৃতির কবিতা',
                'name_en' => 'Nature Poetry',
                'description' => 'প্রকৃতি ও ঋতু বিষয়ক কবিতা',
                'parent' => 'Poetry',
                'is_active' => true,
            ],
            // Short Stories sub-categories
            [
                'name_bn' => 'সামাজিক গল্প',
                'name_en' => 'Social Stories',
                'description' => 'সমাজ জীবন নিয়ে গল্প',
                'parent' => 'Short Stories',
                'is_active' => true,
            ],
            [
                'name_bn' => 'রহস্য গল্প',
                'name_en' => 'Mystery Stories',
                'description' => 'রহস্য ও রোমাঞ্চকর গল্প',
                'parent' => 'Short Stories',
                'is_active' => true,
            ],
            // Essays sub-categories
            [
                'name_bn' => 'সাহিত্য সমালোচনা',
                'name_en' => 'Literary Criticism',
                'description' => 'সাহিত্য বিশ্লেষণ ও সমালোচনা',
                'parent' => 'Essays',
                'is_active' => true,
            ],
        ];

        foreach ($subCategories as $category) {
            $parentKey = $category['parent'];
            unset($category['parent']);

            Category::create([
                ...$category,
                'slug' => Str::slug($category['name_en']),
                'parent_id' => $createdParents[$parentKey]->id,
            ]);
        }
    }
}
