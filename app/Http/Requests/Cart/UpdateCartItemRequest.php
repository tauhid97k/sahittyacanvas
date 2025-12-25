<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
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
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'quantity.required' => 'পরিমাণ আবশ্যক।',
            'quantity.min' => 'পরিমাণ কমপক্ষে ১ হতে হবে।',
            'quantity.max' => 'পরিমাণ সর্বোচ্চ ৯৯ হতে পারে।',
        ];
    }
}
