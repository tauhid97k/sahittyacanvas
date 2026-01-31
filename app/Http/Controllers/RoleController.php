<?php

namespace App\Http\Controllers;

use App\Enums\Permission as PermissionEnum;
use App\Enums\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::LIST_ROLE->value)) {
            abort(403);
        }

        $roles = SpatieRole::query()
            ->withCount('permissions')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->get('search')}%");
            })
            ->orderBy('name')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('dashboard/roles/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $request->get('search', ''),
            ],
            'can' => [
                'create_role' => $request->user()->can(PermissionEnum::CREATE_ROLE->value),
                'edit_role' => $request->user()->can(PermissionEnum::EDIT_ROLE->value),
                'delete_role' => $request->user()->can(PermissionEnum::DELETE_ROLE->value),
                'view_role' => $request->user()->can(PermissionEnum::VIEW_ROLE->value),
                'manage_permissions' => $request->user()->can(PermissionEnum::MANAGE_ROLE_PERMISSIONS->value),
            ],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(Request $request): Response
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::CREATE_ROLE->value)) {
            abort(403);
        }

        $permissions = Permission::query()
            ->select('id', 'name', 'group')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        return Inertia::render('dashboard/roles/create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::CREATE_ROLE->value)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = SpatieRole::create(['name' => strtoupper($validated['name'])]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role with its permissions.
     */
    public function show(Request $request, SpatieRole $role): Response
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::VIEW_ROLE->value)) {
            abort(403);
        }

        $role->load('permissions:id,name,group');

        $permissionsByGroup = $role->permissions->groupBy('group');

        return Inertia::render('dashboard/roles/show', [
            'role' => $role,
            'permissionsByGroup' => $permissionsByGroup,
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Request $request, SpatieRole $role): Response
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::EDIT_ROLE->value)) {
            abort(403);
        }

        $role->load('permissions:id,name');

        $permissions = Permission::query()
            ->select('id', 'name', 'group')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        $rolePermissions = $role->permissions->pluck('name')->toArray();

        return Inertia::render('dashboard/roles/edit', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, SpatieRole $role): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::EDIT_ROLE->value)) {
            abort(403);
        }

        // Prevent editing SUPER role
        if ($role->name === Role::SUPER->value) {
            return back()->with('error', 'Cannot edit super admin role.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update(['name' => strtoupper($validated['name'])]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Request $request, SpatieRole $role): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::DELETE_ROLE->value)) {
            abort(403);
        }

        // Prevent deleting system roles
        $systemRoles = [Role::SUPER->value, Role::USER->value, Role::AUTHOR->value, Role::SELLER->value];
        if (in_array($role->name, $systemRoles)) {
            return back()->with('error', 'Cannot delete system role.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted successfully.');
    }

    /**
     * Show permissions for a role (modal view).
     */
    public function permissions(Request $request, SpatieRole $role): Response
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::MANAGE_ROLE_PERMISSIONS->value)) {
            abort(403);
        }

        $role->load('permissions:id,name,group');

        $allPermissions = Permission::query()
            ->select('id', 'name', 'group')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        $rolePermissions = $role->permissions->pluck('name')->toArray();

        return Inertia::render('dashboard/roles/permissions', [
            'role' => $role,
            'allPermissions' => $allPermissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    /**
     * Update permissions for a role.
     */
    public function updatePermissions(Request $request, SpatieRole $role): RedirectResponse
    {
        // Check permission
        if ($request->user()->cannot(PermissionEnum::MANAGE_ROLE_PERMISSIONS->value)) {
            abort(403);
        }

        // Prevent editing SUPER role permissions
        if ($role->name === Role::SUPER->value) {
            return back()->with('error', 'Cannot edit super admin permissions.');
        }

        $validated = $request->validate([
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', 'Permissions updated successfully.');
    }
}
