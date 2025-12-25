<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name_bn' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:50'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'compare_price' => ['nullable', 'numeric', 'min:0', 'max:9999999.99', 'gt:price'],
            'stock_count' => ['required', 'integer', 'min:0', 'max:999999'],
            'stock_alert_threshold' => ['nullable', 'integer', 'min:0', 'max:999'],
            'sku' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:draft,published'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['exists:product_categories,id'],
            'featured_image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
            'remove_images' => ['nullable', 'array'],
            'remove_images.*' => ['integer'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name_bn.required' => 'বাংলা নাম আবশ্যক।',
            'description.required' => 'পণ্যের বিবরণ আবশ্যক।',
            'description.min' => 'পণ্যের বিবরণ কমপক্ষে ৫০ অক্ষর হতে হবে।',
            'price.required' => 'মূল্য আবশ্যক।',
            'price.min' => 'মূল্য ০ এর কম হতে পারবে না।',
            'compare_price.gt' => 'তুলনামূলক মূল্য অবশ্যই মূল মূল্যের চেয়ে বেশি হতে হবে।',
            'stock_count.required' => 'স্টক সংখ্যা আবশ্যক।',
            'categories.required' => 'কমপক্ষে একটি ক্যাটাগরি নির্বাচন করুন।',
            'categories.min' => 'কমপক্ষে একটি ক্যাটাগরি নির্বাচন করুন।',
            'featured_image.max' => 'ফিচার্ড ছবির আকার ৫ মেগাবাইটের বেশি হতে পারবে না।',
            'images.max' => 'সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে।',
            'images.*.max' => 'প্রতিটি ছবির আকার ৫ মেগাবাইটের বেশি হতে পারবে না।',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert price from taka to paisa (cents)
        if ($this->has('price')) {
            $this->merge([
                'price_in_cents' => (int) round($this->price * 100),
            ]);
        }

        if ($this->has('compare_price') && $this->compare_price) {
            $this->merge([
                'compare_price_in_cents' => (int) round($this->compare_price * 100),
            ]);
        }
    }
}
