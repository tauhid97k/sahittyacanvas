<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareNotifications
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $notifications = $request->user()
                ->notifications()
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($notification) {
                    $data = $notification->data;

                    return [
                        'id' => $notification->id,
                        'type' => $data['type'] ?? 'system',
                        'title' => $data['title'] ?? 'Notification',
                        'message' => $data['message'] ?? '',
                        'data' => $data,
                        'read_at' => $notification->read_at?->toISOString(),
                        'created_at' => $notification->created_at->toISOString(),
                    ];
                });

            $unreadCount = $request->user()->unreadNotifications()->count();

            Inertia::share('notifications', [
                'items' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        return $next($request);
    }
}
