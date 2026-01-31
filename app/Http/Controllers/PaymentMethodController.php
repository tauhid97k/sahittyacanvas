<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of payment methods.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_PAYMENT_METHOD->value)) {
            abort(403);
        }

        $paymentMethods = PaymentMethod::query()
            ->with('media')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->ordered()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Add icon_url to each payment method
        $paymentMethods->through(function ($method) {
            $method->icon_url = $method->icon_url;
            return $method;
        });

        return Inertia::render('dashboard/payment-methods/index', [
            'paymentMethods' => $paymentMethods,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    /**
     * Store a newly created payment method.
     */
    public function store(Request $request): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::CREATE_PAYMENT_METHOD->value)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:payment_methods,name'],
            'type' => ['required', 'string', 'in:mobile_banking,bank,cod'],
            'description' => ['nullable', 'string', 'max:1000'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:1024'],
            'is_active' => ['boolean'],
            'is_cod' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Generate slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (PaymentMethod::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $paymentMethod = PaymentMethod::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_cod' => $validated['is_cod'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        // Handle icon upload
        if ($request->hasFile('icon')) {
            $paymentMethod->addMediaFromRequest('icon')
                ->toMediaCollection('icon');
        }

        return back()->with('success', 'পেমেন্ট মেথড সফলভাবে তৈরি হয়েছে।');
    }

    /**
     * Update the specified payment method.
     */
    public function update(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::EDIT_PAYMENT_METHOD->value)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('payment_methods', 'name')->ignore($paymentMethod->id)],
            'type' => ['required', 'string', 'in:mobile_banking,bank,cod'],
            'description' => ['nullable', 'string', 'max:1000'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:1024'],
            'remove_icon' => ['nullable', 'boolean'],
            'is_active' => ['boolean'],
            'is_cod' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Generate new slug if name changed
        if ($validated['name'] !== $paymentMethod->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (PaymentMethod::where('slug', $slug)->where('id', '!=', $paymentMethod->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
        } else {
            $slug = $paymentMethod->slug;
        }

        $paymentMethod->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_cod' => $validated['is_cod'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        // Handle icon: upload new or remove existing
        if ($request->hasFile('icon')) {
            $paymentMethod->clearMediaCollection('icon');
            $paymentMethod->addMediaFromRequest('icon')
                ->toMediaCollection('icon');
        } elseif ($validated['remove_icon'] ?? false) {
            $paymentMethod->clearMediaCollection('icon');
        }

        return back()->with('success', 'পেমেন্ট মেথড সফলভাবে আপডেট হয়েছে।');
    }

    /**
     * Remove the specified payment method.
     */
    public function destroy(Request $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::DELETE_PAYMENT_METHOD->value)) {
            abort(403);
        }

        // Check if payment method has transactions
        if ($paymentMethod->transactions()->exists()) {
            return back()->with('error', 'এই পেমেন্ট মেথড মুছে ফেলা যাবে না কারণ এটি লেনদেনে ব্যবহৃত হয়েছে।');
        }

        $paymentMethod->clearMediaCollection('icon');
        $paymentMethod->delete();

        return back()->with('success', 'পেমেন্ট মেথড সফলভাবে মুছে ফেলা হয়েছে।');
    }
}
