<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user (admin)
        $user = User::first();
        if (!$user) {
            $this->command->warn('No user found. Please create a user first.');
            return;
        }

        // Get categories and authors
        $categories = Category::all();
        $authors = Author::all();

        if ($categories->isEmpty()) {
            $this->command->warn('Please run CategorySeeder first.');
            return;
        }

        // Unsplash images for posts
        $postImages = [
            'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=500&fit=crop',
            'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=500&fit=crop',
        ];

        $posts = [
            [
                'title_bn' => 'সোনার তরী',
                'title_en' => 'Sonar Tori',
                'excerpt' => 'রবীন্দ্রনাথ ঠাকুরের বিখ্যাত কবিতা সোনার তরী।',
                'meta_description' => 'সোনার তরী - রবীন্দ্রনাথ ঠাকুরের কালজয়ী কবিতা',
                'content' => "গগনে গরজে মেঘ, ঘন বরষা।\nকূলে একা বসে আছি, নাহি ভরসা।\nরাশি রাশি ভারা ভারা ধান কাটা হল সারা,\nভরা নদী ক্ষুরধারা খরপরশা।\n\nকাটিতে কাটিতে ধান এল বরষা।\nএকখানি ছোট খেত, আমি একেলা,\nচারি দিকে বাঁকা জল করিছে খেলা।\nপরপারে দেখি আঁকা তরুছায়ামসীমাখা\nগ্রামখানি মেঘে ঢাকা প্রভাতবেলা।",
                'status' => 'published',
                'author_name' => 'Rabindranath Tagore',
                'category_names' => ['Poetry', 'Nature Poetry'],
            ],
            [
                'title_bn' => 'বিদ্রোহী',
                'title_en' => 'Bidrohi',
                'excerpt' => 'কাজী নজরুল ইসলামের বিখ্যাত বিদ্রোহী কবিতা।',
                'meta_description' => 'বিদ্রোহী - কাজী নজরুল ইসলামের অমর সৃষ্টি',
                'content' => "বল বীর—\nবল উন্নত মম শির!\nশির নেহারি আমারি নতশির ওই শিখর হিমাদ্রির!\n\nবল বীর—\nবল মহাবিশ্বের মহাকাশ ফাড়ি'\nচন্দ্র সূর্য গ্রহ তারা ছাড়ি'\nভূলোক দ্যুলোক গোলক ভেদিয়া,\nখোদার আসন 'আরশ' ছেদিয়া,\nউঠিয়াছি চির-বিস্ময় আমি বিশ্ববিধাতৃর!",
                'status' => 'published',
                'author_name' => 'Kazi Nazrul Islam',
                'category_names' => ['Poetry', 'Patriotic Poetry'],
            ],
            [
                'title_bn' => 'বনলতা সেন',
                'title_en' => 'Banalata Sen',
                'excerpt' => 'জীবনানন্দ দাশের সবচেয়ে জনপ্রিয় কবিতা।',
                'meta_description' => 'বনলতা সেন - জীবনানন্দ দাশের কালজয়ী প্রেমের কবিতা',
                'content' => "হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে,\nসিংহল সমুদ্র থেকে নিশীথের অন্ধকারে মালয় সাগরে\nঅনেক ঘুরেছি আমি; বিম্বিসার অশোকের ধূসর জগতে\nসেখানে ছিলাম আমি; আরো দূর অন্ধকারে বিদর্ভ নগরে;\nআমি ক্লান্ত প্রাণ এক, চারিদিকে জীবনের সমুদ্র সফেন,\nআমারে দু-দণ্ড শান্তি দিয়েছিল নাটোরের বনলতা সেন।",
                'status' => 'published',
                'author_name' => 'Jibanananda Das',
                'category_names' => ['Poetry', 'Love Poetry'],
            ],
            [
                'title_bn' => 'দেবদাস',
                'title_en' => 'Devdas',
                'excerpt' => 'শরৎচন্দ্র চট্টোপাধ্যায়ের অমর উপন্যাস দেবদাস।',
                'meta_description' => 'দেবদাস - শরৎচন্দ্র চট্টোপাধ্যায়ের কালজয়ী প্রেমের উপন্যাস',
                'content' => "দেবদাস বাংলা সাহিত্যের অন্যতম জনপ্রিয় উপন্যাস। এটি শরৎচন্দ্র চট্টোপাধ্যায় রচিত একটি রোমান্টিক ট্র্যাজেডি। উপন্যাসটি দেবদাস, পার্বতী এবং চন্দ্রমুখীর জীবনকে কেন্দ্র করে আবর্তিত।\n\nদেবদাস ও পার্বতী শৈশব থেকেই একে অপরকে ভালোবাসত। কিন্তু সামাজিক বাধার কারণে তাদের মিলন হয়নি। পার্বতীর বিয়ে হয়ে যায় অন্যত্র, আর দেবদাস মদ্যপানে আসক্ত হয়ে পড়ে।",
                'status' => 'published',
                'author_name' => 'Sarat Chandra Chattopadhyay',
                'category_names' => ['Novels', 'Social Stories'],
            ],
            [
                'title_bn' => 'আনন্দমঠ',
                'title_en' => 'Anandamath',
                'excerpt' => 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের ঐতিহাসিক উপন্যাস।',
                'meta_description' => 'আনন্দমঠ - বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের বিখ্যাত উপন্যাস',
                'content' => "আনন্দমঠ বঙ্কিমচন্দ্র চট্টোপাধ্যায় রচিত একটি বাংলা উপন্যাস। এই উপন্যাসেই প্রথম 'বন্দে মাতরম' গানটি প্রকাশিত হয়।\n\nউপন্যাসটি ১৭৭০ সালের মন্বন্তরের পটভূমিতে রচিত। সন্ন্যাসী বিদ্রোহের কাহিনী এই উপন্যাসের মূল বিষয়বস্তু।",
                'status' => 'published',
                'author_name' => 'Bankim Chandra Chattopadhyay',
                'category_names' => ['Novels'],
            ],
            [
                'title_bn' => 'মেঘনাদবধ কাব্য',
                'title_en' => 'Meghnad Badh Kavya',
                'excerpt' => 'মাইকেল মধুসূদন দত্তের মহাকাব্য।',
                'meta_description' => 'মেঘনাদবধ কাব্য - বাংলা সাহিত্যের প্রথম সার্থক মহাকাব্য',
                'content' => "মেঘনাদবধ কাব্য বাংলা সাহিত্যের প্রথম সার্থক মহাকাব্য। মাইকেল মধুসূদন দত্ত এই কাব্যে রামায়ণের কাহিনীকে নতুন দৃষ্টিকোণ থেকে উপস্থাপন করেছেন।\n\nএই কাব্যে রাবণ ও মেঘনাদকে বীর হিসেবে এবং রাম ও লক্ষ্মণকে ছলনাকারী হিসেবে চিত্রিত করা হয়েছে।",
                'status' => 'published',
                'author_name' => 'Michael Madhusudan Dutt',
                'category_names' => ['Poetry'],
            ],
            [
                'title_bn' => 'গীতাঞ্জলি',
                'title_en' => 'Gitanjali',
                'excerpt' => 'রবীন্দ্রনাথ ঠাকুরের নোবেল পুরস্কার বিজয়ী কাব্যগ্রন্থ।',
                'meta_description' => 'গীতাঞ্জলি - নোবেল পুরস্কার বিজয়ী কাব্যগ্রন্থ',
                'content' => "গীতাঞ্জলি রবীন্দ্রনাথ ঠাকুরের সবচেয়ে বিখ্যাত কাব্যগ্রন্থ। ১৯১৩ সালে এই কাব্যগ্রন্থের জন্য তিনি সাহিত্যে নোবেল পুরস্কার লাভ করেন।\n\nআমার মাথা নত করে দাও হে তোমার\nচরণধুলার তলে।\nসকল অহংকার হে আমার\nডুবাও চোখের জলে।",
                'status' => 'published',
                'author_name' => 'Rabindranath Tagore',
                'category_names' => ['Poetry'],
            ],
            [
                'title_bn' => 'অগ্নিবীণা',
                'title_en' => 'Agni Veena',
                'excerpt' => 'কাজী নজরুল ইসলামের প্রথম কাব্যগ্রন্থ।',
                'meta_description' => 'অগ্নিবীণা - নজরুলের বিদ্রোহী কবিতার সংকলন',
                'content' => "অগ্নিবীণা কাজী নজরুল ইসলামের প্রথম কাব্যগ্রন্থ। ১৯২২ সালে প্রকাশিত এই কাব্যগ্রন্থে বিদ্রোহী কবিতাটি অন্তর্ভুক্ত।\n\nএই কাব্যগ্রন্থের কবিতাগুলো ব্রিটিশ শাসনের বিরুদ্ধে প্রতিবাদের সুর বহন করে।",
                'status' => 'published',
                'author_name' => 'Kazi Nazrul Islam',
                'category_names' => ['Poetry', 'Patriotic Poetry'],
            ],
            [
                'title_bn' => 'পথের পাঁচালী',
                'title_en' => 'Pather Panchali',
                'excerpt' => 'বিভূতিভূষণ বন্দ্যোপাধ্যায়ের কালজয়ী উপন্যাস।',
                'meta_description' => 'পথের পাঁচালী - বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ উপন্যাস',
                'content' => "পথের পাঁচালী বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ উপন্যাস। বিভূতিভূষণ বন্দ্যোপাধ্যায় রচিত এই উপন্যাসটি অপু ও দুর্গার শৈশবের কাহিনী।\n\nগ্রামবাংলার প্রকৃতি ও মানুষের জীবন এই উপন্যাসে অপূর্ব সুন্দরভাবে ফুটে উঠেছে।",
                'status' => 'published',
                'author_name' => null,
                'category_names' => ['Novels'],
            ],
            [
                'title_bn' => 'শ্রীকান্ত',
                'title_en' => 'Srikanta',
                'excerpt' => 'শরৎচন্দ্র চট্টোপাধ্যায়ের আত্মজীবনীমূলক উপন্যাস।',
                'meta_description' => 'শ্রীকান্ত - শরৎচন্দ্রের আত্মজীবনীমূলক উপন্যাস',
                'content' => "শ্রীকান্ত শরৎচন্দ্র চট্টোপাধ্যায়ের আত্মজীবনীমূলক উপন্যাস। চার খণ্ডে বিভক্ত এই উপন্যাসে শ্রীকান্তের জীবনের বিভিন্ন পর্যায় বর্ণিত হয়েছে।\n\nইন্দ্রনাথ, রাজলক্ষ্মী, অভয়া, কমললতা প্রভৃতি চরিত্র এই উপন্যাসকে সমৃদ্ধ করেছে।",
                'status' => 'published',
                'author_name' => 'Sarat Chandra Chattopadhyay',
                'category_names' => ['Novels', 'Social Stories'],
            ],
            [
                'title_bn' => 'সাহিত্যে বাস্তববাদ',
                'title_en' => 'Realism in Literature',
                'excerpt' => 'বাংলা সাহিত্যে বাস্তববাদের প্রভাব নিয়ে প্রবন্ধ।',
                'meta_description' => 'সাহিত্যে বাস্তববাদ - বাংলা সাহিত্যের বিশ্লেষণ',
                'content' => "বাস্তববাদ সাহিত্যের একটি গুরুত্বপূর্ণ ধারা। উনিশ শতকে ইউরোপে এই ধারার উদ্ভব হয় এবং পরবর্তীতে বাংলা সাহিত্যেও এর প্রভাব পড়ে।\n\nবঙ্কিমচন্দ্র, শরৎচন্দ্র, বিভূতিভূষণ প্রমুখ লেখকদের রচনায় বাস্তববাদের প্রভাব স্পষ্ট।",
                'status' => 'published',
                'author_name' => null,
                'category_names' => ['Essays', 'Literary Criticism'],
            ],
            [
                'title_bn' => 'রবীন্দ্র সাহিত্যে প্রকৃতি',
                'title_en' => 'Nature in Rabindranath Literature',
                'excerpt' => 'রবীন্দ্রনাথের সাহিত্যে প্রকৃতির ভূমিকা নিয়ে আলোচনা।',
                'meta_description' => 'রবীন্দ্র সাহিত্যে প্রকৃতি - সাহিত্য সমালোচনা',
                'content' => "রবীন্দ্রনাথ ঠাকুরের সাহিত্যে প্রকৃতি একটি গুরুত্বপূর্ণ উপাদান। তাঁর কবিতা, গান, ছোটগল্প সর্বত্রই প্রকৃতির উপস্থিতি লক্ষণীয়।\n\nশান্তিনিকেতনের প্রকৃতি তাঁর সৃষ্টিকে গভীরভাবে প্রভাবিত করেছে।",
                'status' => 'published',
                'author_name' => null,
                'category_names' => ['Essays'],
            ],
        ];

        foreach ($posts as $index => $postData) {
            // Find related models
            $author = $postData['author_name'] 
                ? $authors->firstWhere('name_en', $postData['author_name']) 
                : null;
            
            // Find category IDs
            $categoryIds = $categories
                ->whereIn('name_en', $postData['category_names'])
                ->pluck('id')
                ->toArray();

            // Create post with content
            $slugSource = $postData['title_en'] ?: $postData['title_bn'];
            $post = Post::create([
                'title_bn' => $postData['title_bn'],
                'title_en' => $postData['title_en'],
                'excerpt' => $postData['excerpt'],
                'content' => $postData['content'],
                'meta_description' => $postData['meta_description'],
                'status' => $postData['status'],
                'user_id' => $user->id,
                'author_id' => $author?->id,
                'slug' => Str::slug($slugSource),
                'published_at' => $postData['status'] === 'published' ? now()->subDays(rand(1, 30)) : null,
            ]);

            // Add featured image from URL using Spatie MediaLibrary
            $imageUrl = $postImages[$index % count($postImages)];
            try {
                $post->addMediaFromUrl($imageUrl)->toMediaCollection('featured');
            } catch (\Exception $e) {
                $this->command->warn("Could not add image for post: {$post->title_bn}");
            }

            // Attach categories
            $post->categories()->attach($categoryIds);
        }

        $this->command->info('Created ' . count($posts) . ' posts.');
    }
}
