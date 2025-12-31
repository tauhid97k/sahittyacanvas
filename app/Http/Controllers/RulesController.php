<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RulesController extends Controller
{
    /**
     * Display the public rules page.
     */
    public function index(Request $request): Response
    {
        $tab = $request->get('tab', 'seller-rules');

        return Inertia::render('dashboard/rules/index', [
            'filters' => [
                'tab' => $tab,
            ],
            'rules' => [
                'seller_rules' => PlatformSetting::getSellerRules(),
                'author_rules' => PlatformSetting::getAuthorRules(),
                'terms_of_service' => PlatformSetting::getTermsOfService(),
                'privacy_policy' => PlatformSetting::getPrivacyPolicy(),
            ],
        ]);
    }
}
