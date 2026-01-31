<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_ACTIVITY->value)) {
            abort(403);
        }

        $activities = Activity::query()
            ->with(['causer', 'subject'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('subject_type', 'like', "%{$search}%")
                      ->orWhere('event', 'like', "%{$search}%")
                      ->orWhere('log_name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('event'), function ($query) use ($request) {
                $query->where('event', $request->get('event'));
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->get('date_from'));
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->get('date_to'));
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform the data to include readable subject type
        $activities->through(function ($activity) {
            $activity->subject_type_label = $activity->subject_type 
                ? class_basename($activity->subject_type) 
                : null;
            $activity->causer_name = $activity->causer?->name ?? 'System';
            return $activity;
        });

        // Get unique events for filter
        $events = Activity::distinct()->pluck('event')->filter()->values();

        return Inertia::render('dashboard/activities/index', [
            'activities' => $activities,
            'events' => $events,
            'filters' => [
                'search' => $request->get('search', ''),
                'event' => $request->get('event', ''),
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
            ],
        ]);
    }

    /**
     * Display the specified activity.
     */
    public function show(Request $request, Activity $activity): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::VIEW_ACTIVITY->value)) {
            abort(403);
        }

        $activity->load(['causer', 'subject']);
        $activity->subject_type_label = $activity->subject_type 
            ? class_basename($activity->subject_type) 
            : null;
        $activity->causer_name = $activity->causer?->name ?? 'System';

        return Inertia::render('dashboard/activities/show', [
            'activity' => $activity,
        ]);
    }
}
