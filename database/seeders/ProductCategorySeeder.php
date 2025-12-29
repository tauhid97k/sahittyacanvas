<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if categories already exist
        if (ProductCategory::count() > 0) {
            $this->command->info('Product categories already exist. Skipping...');
            return;
        }

        $categories = [
            [
                'name_bn' => 'পুরুষ',
                'name_en' => 'Men',
                'description' => 'Men\'s clothing and accessories',
                'children' => [
                    ['name_bn' => 'শার্ট', 'name_en' => 'Shirts'],
                    ['name_bn' => 'প্যান্ট', 'name_en' => 'Pants'],
                    ['name_bn' => 'জুতা', 'name_en' => 'Shoes'],
                ],
            ],
            [
                'name_bn' => 'মহিলা',
                'name_en' => 'Women',
                'description' => 'Women\'s clothing and accessories',
                'children' => [
                    ['name_bn' => 'শাড়ি', 'name_en' => 'Saree'],
                    ['name_bn' => 'সালোয়ার কামিজ', 'name_en' => 'Salwar Kameez'],
                    ['name_bn' => 'জুয়েলারি', 'name_en' => 'Jewelry'],
                ],
            ],
            [
                'name_bn' => 'ইলেকট্রনিক্স',
                'name_en' => 'Electronics',
                'description' => 'Electronic devices and gadgets',
                'children' => [
                    ['name_bn' => 'মোবাইল ফোন', 'name_en' => 'Mobile Phones'],
                    ['name_bn' => 'ল্যাপটপ', 'name_en' => 'Laptops'],
                    ['name_bn' => 'হেডফোন', 'name_en' => 'Headphones'],
                ],
            ],
            [
                'name_bn' => 'বই',
                'name_en' => 'Books',
                'description' => 'Books and publications',
                'children' => [
                    ['name_bn' => 'উপন্যাস', 'name_en' => 'Novels'],
                    ['name_bn' => 'শিক্ষামূলক', 'name_en' => 'Educational'],
                    ['name_bn' => 'ধর্মীয়', 'name_en' => 'Religious'],
                ],
            ],
            [
                'name_bn' => 'গৃহস্থালি',
                'name_en' => 'Home & Living',
                'description' => 'Home decor and living essentials',
                'children' => [
                    ['name_bn' => 'আসবাবপত্র', 'name_en' => 'Furniture'],
                    ['name_bn' => 'রান্নাঘর', 'name_en' => 'Kitchen'],
                    ['name_bn' => 'বিছানা', 'name_en' => 'Bedding'],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $slug = Str::slug($categoryData['name_en'] ?? $categoryData['name_bn']);
            
            $parent = ProductCategory::create([
                'name_bn' => $categoryData['name_bn'],
                'name_en' => $categoryData['name_en'] ?? null,
                'slug' => $slug,
                'description' => $categoryData['description'] ?? null,
                'is_active' => true,
            ]);

            foreach ($children as $childData) {
                $childSlug = Str::slug($childData['name_en'] ?? $childData['name_bn']);
                
                ProductCategory::create([
                    'name_bn' => $childData['name_bn'],
                    'name_en' => $childData['name_en'] ?? null,
                    'slug' => $childSlug,
                    'parent_id' => $parent->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
