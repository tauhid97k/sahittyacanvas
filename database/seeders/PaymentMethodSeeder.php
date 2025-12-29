<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'বিকাশ',
                'slug' => 'bkash',
                'type' => 'mobile_banking',
                'description' => 'বিকাশ মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
                'instructions' => 'বিকাশ অ্যাপ থেকে পেমেন্ট করুন এবং ট্রানজেকশন আইডি সংরক্ষণ করুন।',
                'icon' => 'bkash',
                'is_active' => true,
                'is_cod' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'নগদ',
                'slug' => 'nagad',
                'type' => 'mobile_banking',
                'description' => 'নগদ মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
                'instructions' => 'নগদ অ্যাপ থেকে পেমেন্ট করুন এবং ট্রানজেকশন আইডি সংরক্ষণ করুন।',
                'icon' => 'nagad',
                'is_active' => true,
                'is_cod' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'রকেট',
                'slug' => 'rocket',
                'type' => 'mobile_banking',
                'description' => 'রকেট মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
                'instructions' => 'রকেট অ্যাপ থেকে পেমেন্ট করুন এবং ট্রানজেকশন আইডি সংরক্ষণ করুন।',
                'icon' => 'rocket',
                'is_active' => true,
                'is_cod' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'উপায়',
                'slug' => 'upay',
                'type' => 'mobile_banking',
                'description' => 'উপায় মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন',
                'instructions' => 'উপায় অ্যাপ থেকে পেমেন্ট করুন এবং ট্রানজেকশন আইডি সংরক্ষণ করুন।',
                'icon' => 'upay',
                'is_active' => true,
                'is_cod' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'ব্যাংক ট্রান্সফার',
                'slug' => 'bank',
                'type' => 'bank',
                'description' => 'সরাসরি ব্যাংক ট্রান্সফার করুন',
                'instructions' => 'বিক্রেতার ব্যাংক অ্যাকাউন্টে টাকা ট্রান্সফার করুন এবং রেফারেন্স নম্বর সংরক্ষণ করুন।',
                'icon' => 'bank',
                'is_active' => true,
                'is_cod' => false,
                'sort_order' => 5,
            ],
            [
                'name' => 'ক্যাশ অন ডেলিভারি',
                'slug' => 'cod',
                'type' => 'cod',
                'description' => 'পণ্য হাতে পেয়ে টাকা দিন',
                'instructions' => 'পণ্য ডেলিভারির সময় নগদ টাকা দিন।',
                'icon' => 'cash',
                'is_active' => true,
                'is_cod' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::create($method);
        }
    }
}
