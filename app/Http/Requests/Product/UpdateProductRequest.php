<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $product = $this->route('product');
        
        $rules = [
            'name_bn' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'discount_type' => ['nullable', 'in:percentage,flat'],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'stock_count' => ['required', 'integer', 'min:0', 'max:999999'],
            'stock_alert_threshold' => ['nullable', 'integer', 'min:0', 'max:999'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product)],
            'status' => ['required', 'in:draft,published,archived'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['exists:product_categories,id'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
            'removed_images' => ['nullable', 'array'],
            'removed_images.*' => ['integer'],
            'remove_featured_image' => ['nullable', 'boolean'],
        ];

        // Add conditional validation for discount_value
        if ($this->discount_type === 'percentage') {
            $rules['discount_value'] = ['required_with:discount_type', 'numeric', 'min:1', 'max:100'];
        } elseif ($this->discount_type === 'flat') {
            $rules['discount_value'] = ['required_with:discount_type', 'numeric', 'min:0.01', 'lt:price'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name_bn.required' => 'Name (Bengali) is required.',
                        'price.required' => 'Price is required.',
            'price.min' => 'Price must be greater than 0.',
            'discount_value.required_with' => 'Discount value is required when discount type is selected.',
            'discount_value.max' => 'Percentage discount cannot exceed 100%.',
            'discount_value.lt' => 'Flat discount must be less than the price.',
            'stock_count.required' => 'Stock count is required.',
            'images.max' => 'Maximum 10 images allowed.',
            'images.*.max' => 'Each image must be less than 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean up empty discount fields
        if ($this->discount_type === '' || $this->discount_type === null) {
            $this->merge([
                'discount_type' => null,
                'discount_value' => null,
            ]);
        }
    }
}
