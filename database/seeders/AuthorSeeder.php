<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authors = [
            [
                'name_bn' => 'রবীন্দ্রনাথ ঠাকুর',
                'name_en' => 'Rabindranath Tagore',
                'bio' => 'বাংলা সাহিত্যের সর্বশ্রেষ্ঠ কবি, নোবেল পুরস্কার বিজয়ী (১৯১৩)।',
                'birth_date' => '1861-05-07',
                'death_date' => '1941-08-07',
                'nationality' => 'ভারতীয়',
                'is_active' => true,
            ],
            [
                'name_bn' => 'কাজী নজরুল ইসলাম',
                'name_en' => 'Kazi Nazrul Islam',
                'bio' => 'বাংলাদেশের জাতীয় কবি, বিদ্রোহী কবি নামে পরিচিত।',
                'birth_date' => '1899-05-24',
                'death_date' => '1976-08-29',
                'nationality' => 'বাংলাদেশী',
                'is_active' => true,
            ],
            [
                'name_bn' => 'জীবনানন্দ দাশ',
                'name_en' => 'Jibanananda Das',
                'bio' => 'আধুনিক বাংলা কবিতার অন্যতম প্রধান কবি।',
                'birth_date' => '1899-02-17',
                'death_date' => '1954-10-22',
                'nationality' => 'ভারতীয়',
                'is_active' => true,
            ],
            [
                'name_bn' => 'শরৎচন্দ্র চট্টোপাধ্যায়',
                'name_en' => 'Sarat Chandra Chattopadhyay',
                'bio' => 'বাংলা সাহিত্যের জনপ্রিয় ঔপন্যাসিক।',
                'birth_date' => '1876-09-15',
                'death_date' => '1938-01-16',
                'nationality' => 'ভারতীয়',
                'is_active' => true,
            ],
            [
                'name_bn' => 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
                'name_en' => 'Bankim Chandra Chattopadhyay',
                'bio' => 'বাংলা উপন্যাসের জনক, বন্দে মাতরম গানের রচয়িতা।',
                'birth_date' => '1838-06-27',
                'death_date' => '1894-04-08',
                'nationality' => 'ভারতীয়',
                'is_active' => true,
            ],
            [
                'name_bn' => 'মাইকেল মধুসূদন দত্ত',
                'name_en' => 'Michael Madhusudan Dutt',
                'bio' => 'বাংলা সাহিত্যের আধুনিক যুগের পথিকৃৎ।',
                'birth_date' => '1824-01-25',
                'death_date' => '1873-06-29',
                'nationality' => 'ভারতীয়',
                'is_active' => true,
            ],
        ];

        foreach ($authors as $author) {
            Author::updateOrCreate(
                ['slug' => Str::slug($author['name_en'])],
                [
                    ...$author,
                    'slug' => Str::slug($author['name_en']),
                ]
            );
        }
    }
}
