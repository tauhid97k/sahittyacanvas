<?php

namespace App\Http\Requests\Category;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'name_bn' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if (Category::whereRaw('LOWER(name_bn) = ?', [mb_strtolower($value)])->exists()) {
                        $fail('This category name (Bengali) already exists.');
                    }
                },
            ],
            'name_en' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if (Category::whereRaw('LOWER(name_en) = ?', [strtolower($value)])->exists()) {
                        $fail('This category name (English) already exists.');
                    }
                },
            ],
            'description' => ['nullable', 'string'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'is_active' => ['boolean'],
        ];
    }
}
