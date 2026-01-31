<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role as SpatieRole;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::LIST_USER->value)) {
            abort(403);
        }

        $users = User::query()
            ->with('roles:id,name')
            ->withCount(['posts', 'followers'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('role'), function ($query) use ($request) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->get('role'));
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $status = $request->get('status');
                if ($status === 'banned') {
                    $query->whereNotNull('banned_at');
                } elseif ($status === 'active') {
                    $query->whereNull('banned_at');
                }
            })
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', Role::SUPER->value);
            })
            ->latest()
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Get roles for create/edit modals
        $roles = SpatieRole::whereNot('name', Role::SUPER->value)
            ->select('id', 'name')
            ->get();

        return Inertia::render('dashboard/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'role' => $request->get('role', ''),
            ],
            'can' => [
                'create_user' => $request->user()->can(Permission::CREATE_USER->value),
                'edit_user' => $request->user()->can(Permission::EDIT_USER->value),
                'delete_user' => $request->user()->can(Permission::DELETE_USER->value),
                'ban_user' => $request->user()->can(Permission::BAN_USER->value),
                'view_user' => $request->user()->can(Permission::VIEW_USER->value),
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::CREATE_USER->value)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->syncRoles($validated['roles']);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): Response
    {
        // Check permission
        if ($request->user()->cannot(Permission::VIEW_USER->value)) {
            abort(403);
        }

        $user->load('roles:id,name');
        $user->loadCount(['posts', 'followers', 'following']);

        $tab = $request->get('tab', 'posts');
        $perPage = $request->get('per_page', 10);

        $tabData = null;

        if ($tab === 'posts') {
            $tabData = $user->posts()
                ->with(['categories:id,name_bn,name_en', 'author:id,name_bn,name_en', 'media'])
                ->select('id', 'user_id', 'author_id', 'title_bn', 'title_en', 'slug', 'excerpt', 'status', 'created_at')
                ->latest()
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn ($post) => [
                    'id' => $post->id,
                    'title_bn' => $post->title_bn,
                    'title_en' => $post->title_en,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'status' => $post->status,
                    'featured_image_url' => $post->featured_image_url,
                    'created_at' => $post->created_at,
                    'categories' => $post->categories,
                    'author' => $post->author,
                ]);
        } elseif ($tab === 'products') {
            $tabData = $user->products()
                ->with(['categories:id,name_bn', 'media'])
                ->select('id', 'user_id', 'name_bn', 'name_en', 'slug', 'status', 'price', 'discount_type', 'discount_value', 'stock_count', 'created_at')
                ->latest()
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn ($product) => [
                    'id' => $product->id,
                    'name_bn' => $product->name_bn,
                    'name_en' => $product->name_en,
                    'slug' => $product->slug,
                    'status' => $product->status,
                    'featured_image_url' => $product->featured_image_url,
                    'formatted_price' => $product->formatted_price,
                    'formatted_discounted_price' => $product->formatted_discounted_price,
                    'discount_percentage' => $product->discount_percentage,
                    'stock_count' => $product->stock_count,
                    'created_at' => $product->created_at,
                    'categories' => $product->categories,
                ]);
        } elseif ($tab === 'followers') {
            $tabData = $user->followers()
                ->with('follower:id,name,email,username,avatar')
                ->latest()
                ->paginate($perPage)
                ->withQueryString();
        }

        return Inertia::render('dashboard/users/show', [
            'user' => $user,
            'tabData' => $tabData,
            'activeTab' => $tab,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::EDIT_USER->value)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles($validated['roles']);

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::DELETE_USER->value)) {
            abort(403);
        }

        // Prevent deleting super admin
        if ($user->hasRole(Role::SUPER->value)) {
            return back()->with('error', 'Cannot delete super admin.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Ban a user.
     */
    public function ban(Request $request, User $user): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::BAN_USER->value)) {
            abort(403);
        }

        // Prevent banning super admin
        if ($user->hasRole(Role::SUPER->value)) {
            return back()->with('error', 'Cannot ban super admin.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update([
            'banned_at' => now(),
            'ban_reason' => $validated['reason'] ?? null,
        ]);

        return back()->with('success', 'User banned successfully.');
    }

    /**
     * Unban a user.
     */
    public function unban(Request $request, User $user): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(Permission::BAN_USER->value)) {
            abort(403);
        }

        $user->update([
            'banned_at' => null,
            'ban_reason' => null,
        ]);

        return back()->with('success', 'User unbanned successfully.');
    }
}
