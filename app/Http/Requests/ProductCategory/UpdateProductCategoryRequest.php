<?php

namespace App\Http\Requests\ProductCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductCategoryRequest extends FormRequest
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
        $categoryId = $this->route('product_category')->id;

        return [
            'name_bn' => ['required', 'string', 'max:255', Rule::unique('product_categories', 'name_bn')->ignore($categoryId)],
            'name_en' => ['nullable', 'string', 'max:255', Rule::unique('product_categories', 'name_en')->ignore($categoryId)],
            'description' => ['nullable', 'string', 'max:5000'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'parent_id' => ['nullable', 'exists:product_categories,id', Rule::notIn([$categoryId])],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name_bn.required' => 'বাংলা নাম আবশ্যক।',
            'name_bn.unique' => 'এই বাংলা নামটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
            'name_en.unique' => 'এই ইংরেজি নামটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
            'parent_id.exists' => 'নির্বাচিত প্যারেন্ট ক্যাটাগরি বিদ্যমান নেই।',
            'parent_id.not_in' => 'একটি ক্যাটাগরি নিজেই তার প্যারেন্ট হতে পারে না।',
            'image.max' => 'ছবির আকার ২ মেগাবাইটের বেশি হতে পারবে না।',
        ];
    }
}
