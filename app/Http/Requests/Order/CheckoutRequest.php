<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
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
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:20', 'regex:/^(\+88)?01[3-9]\d{8}$/'],
            'shipping_email' => ['nullable', 'email', 'max:255'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_area' => ['nullable', 'string', 'max:100'],
            'shipping_postal_code' => ['nullable', 'string', 'max:10'],
            'buyer_notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['required', 'string', 'in:cod,bkash,nagad,bank'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'shipping_name.required' => 'নাম আবশ্যক।',
            'shipping_phone.required' => 'ফোন নম্বর আবশ্যক।',
            'shipping_phone.regex' => 'সঠিক বাংলাদেশি ফোন নম্বর দিন।',
            'shipping_address.required' => 'ঠিকানা আবশ্যক।',
            'shipping_city.required' => 'শহর আবশ্যক।',
            'payment_method.required' => 'পেমেন্ট পদ্ধতি নির্বাচন করুন।',
            'payment_method.in' => 'অবৈধ পেমেন্ট পদ্ধতি।',
        ];
    }
}
