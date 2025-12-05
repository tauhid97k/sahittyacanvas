<?php

namespace App\Http\Requests\Category;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        /** @var Category $category */
        $category = $this->route('category');

        return [
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'name_bn' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($category) {
                    if (Category::whereRaw('LOWER(name_bn) = ?', [mb_strtolower($value)])
                        ->where('id', '!=', $category->id)
                        ->exists()) {
                        $fail('This category name (Bengali) already exists.');
                    }
                },
            ],
            'name_en' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($category) {
                    if (Category::whereRaw('LOWER(name_en) = ?', [strtolower($value)])
                        ->where('id', '!=', $category->id)
                        ->exists()) {
                        $fail('This category name (English) already exists.');
                    }
                },
            ],
            'description' => ['nullable', 'string'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value == $category->id) {
                        $fail('A category cannot be its own parent.');
                    }
                    if ($value && $category->descendants()->where('id', $value)->exists()) {
                        $fail('A category cannot have a descendant as its parent.');
                    }
                },
            ],
            'is_active' => ['boolean'],
            'remove_image' => ['boolean'],
        ];
    }
}
