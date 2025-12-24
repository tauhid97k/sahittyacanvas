<?php

namespace App\Http\Controllers;

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
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
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
    public function show(SpatieRole $role): Response
    {
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
    public function edit(SpatieRole $role): Response
    {
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
    public function destroy(SpatieRole $role): RedirectResponse
    {
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
    public function permissions(SpatieRole $role): Response
    {
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
