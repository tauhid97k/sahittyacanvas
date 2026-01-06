<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        // If the request wants JSON (API) or has X-Inertia header with preserveScroll
        // This means it's likely from a modal login, so we should redirect back
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 200);
        }

        // Check if the request came from a non-auth page (modal login)
        $previousUrl = url()->previous();
        $loginUrl = url('/login');
        $registerUrl = url('/register');
        
        // If the previous URL is not the login or register page, redirect back there
        if ($previousUrl && $previousUrl !== $loginUrl && $previousUrl !== $registerUrl) {
            return redirect()->intended($previousUrl);
        }

        // Default: redirect to dashboard
        return redirect()->intended(config('fortify.home'));
    }
}
