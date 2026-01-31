<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Notifications\CommissionPercentageChanged;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    /**
     * Display the platform settings page.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_PLATFORM_SETTINGS->value)) {
            abort(403);
        }

        $tab = $request->get('tab', 'platform');

        return Inertia::render('dashboard/settings/index', [
            'filters' => [
                'tab' => $tab,
            ],
            'settings' => [
                'platform_commission_percentage' => PlatformSetting::getCommissionPercentage(),
                'seller_rules' => PlatformSetting::getSellerRules(),
                'author_rules' => PlatformSetting::getAuthorRules(),
                'terms_of_service' => PlatformSetting::getTermsOfService(),
                'privacy_policy' => PlatformSetting::getPrivacyPolicy(),
            ],
        ]);
    }

    /**
     * Update platform commission percentage.
     */
    public function updateCommission(Request $request): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::EDIT_PLATFORM_SETTINGS->value)) {
            abort(403);
        }

        $request->validate([
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $oldPercentage = PlatformSetting::getCommissionPercentage();
        $newPercentage = (float) $request->percentage;

        if ($oldPercentage !== $newPercentage) {
            PlatformSetting::setCommissionPercentage($newPercentage);

            // Notify all sellers about the commission change
            $sellers = User::role(Role::SELLER->value)->get();
            Notification::send($sellers, new CommissionPercentageChanged($oldPercentage, $newPercentage));
        }

        return back()->with('success', 'Platform commission updated successfully.');
    }

    /**
     * Update seller rules.
     */
    public function updateSellerRules(Request $request): RedirectResponse
    {
        $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.heading' => ['required', 'string', 'max:255'],
            'sections.*.content' => ['required', 'string'],
        ]);

        PlatformSetting::setValue(PlatformSetting::SELLER_RULES, $request->sections, 'json');

        return back()->with('success', 'Seller rules updated successfully.');
    }

    /**
     * Update author rules.
     */
    public function updateAuthorRules(Request $request): RedirectResponse
    {
        $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.heading' => ['required', 'string', 'max:255'],
            'sections.*.content' => ['required', 'string'],
        ]);

        PlatformSetting::setValue(PlatformSetting::AUTHOR_RULES, $request->sections, 'json');

        return back()->with('success', 'Author rules updated successfully.');
    }

    /**
     * Update terms of service.
     */
    public function updateTermsOfService(Request $request): RedirectResponse
    {
        $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.heading' => ['required', 'string', 'max:255'],
            'sections.*.content' => ['required', 'string'],
        ]);

        PlatformSetting::setValue(PlatformSetting::TERMS_OF_SERVICE, $request->sections, 'json');

        return back()->with('success', 'Terms of service updated successfully.');
    }

    /**
     * Update privacy policy.
     */
    public function updatePrivacyPolicy(Request $request): RedirectResponse
    {
        $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.heading' => ['required', 'string', 'max:255'],
            'sections.*.content' => ['required', 'string'],
        ]);

        PlatformSetting::setValue(PlatformSetting::PRIVACY_POLICY, $request->sections, 'json');

        return back()->with('success', 'Privacy policy updated successfully.');
    }
}
