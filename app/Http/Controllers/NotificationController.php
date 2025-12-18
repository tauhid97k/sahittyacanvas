<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = $user->notifications();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('data->title', 'like', "%{$search}%")
                    ->orWhere('data->message', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('data->type', $request->get('type'));
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->get('status') === 'read') {
                $query->whereNotNull('read_at');
            } elseif ($request->get('status') === 'unread') {
                $query->whereNull('read_at');
            }
        }

        $notifications = $query->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform notifications for frontend
        $notifications->getCollection()->transform(function ($notification) {
            return $this->transformNotification($notification);
        });

        // Get unique notification types for filter
        $types = DatabaseNotification::query()
            ->where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id)
            ->selectRaw('DISTINCT JSON_UNQUOTE(JSON_EXTRACT(data, \'$."type"\')) as type')
            ->reorder() // Remove any default ordering
            ->pluck('type')
            ->filter()
            ->values()
            ->toArray();

        return Inertia::render('dashboard/notifications/index', [
            'notifications' => $notifications,
            'filters' => $request->only(['search', 'type', 'status']),
            'types' => $types,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return back();
    }

    /**
     * Transform a notification for the frontend.
     */
    protected function transformNotification(DatabaseNotification $notification): array
    {
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
    }
}
