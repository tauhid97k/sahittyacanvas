<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('public/pages/about');
    }

    public function contact(): Response
    {
        return Inertia::render('public/pages/contact');
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Store contact submission
        \App\Models\ContactSubmission::create($validated);

        return back()->with('success', 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে।');
    }

    public function terms(): Response
    {
        $terms = PlatformSetting::getTermsOfService();

        return Inertia::render('public/pages/terms', [
            'sections' => $terms,
        ]);
    }

    public function privacy(): Response
    {
        $privacy = PlatformSetting::getPrivacyPolicy();

        return Inertia::render('public/pages/privacy', [
            'sections' => $privacy,
        ]);
    }

    public function sellerRules(): Response
    {
        $rules = PlatformSetting::getSellerRules();

        return Inertia::render('public/pages/rules', [
            'title' => 'বিক্রেতা নীতিমালা',
            'sections' => $rules,
        ]);
    }

    public function authorRules(): Response
    {
        $rules = PlatformSetting::getAuthorRules();

        return Inertia::render('public/pages/rules', [
            'title' => 'লেখক নীতিমালা',
            'sections' => $rules,
        ]);
    }
}
