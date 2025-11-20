<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Enums\Role as RoleEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            ['name' => PermissionEnum::LIST_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::CREATE_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::EDIT_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::DELETE_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::LIST_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::CREATE_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::EDIT_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::DELETE_ROLE->value, 'group' => 'ROLE'],
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'name' => $permission['name'],
                'group' => $permission['group'],
            ]);
        }

        // Create Roles
        $roles = [
            ['name' => RoleEnum::SUPER->value],
            ['name' => RoleEnum::ADMIN->value],
            ['name' => RoleEnum::USER->value],
            ['name' => RoleEnum::AUTHOR->value],
            ['name' => RoleEnum::EDITOR->value],
            ['name' => RoleEnum::MODERATOR->value],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        // Create Super Admin
        $super = User::create([
            'name' => 'Super Admin',
            'email' => 'super@example.com',
            'password' => Hash::make("admin12345"),
        ]);
        $super->assignRole(RoleEnum::SUPER->value);

        // Create Admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make("admin12345"),
        ]);
        $admin->assignRole(RoleEnum::ADMIN->value);

        // Create User
        $user = User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => Hash::make("user12345"),
        ]);
        $user->assignRole(RoleEnum::USER->value);

        // Create Author
        $author = User::create([
            'name' => 'Author',
            'email' => 'author@example.com',
            'password' => Hash::make("author12345"),
        ]);
        $author->assignRole(RoleEnum::AUTHOR->value);

        // Create Editor
        $editor = User::create([
            'name' => 'Editor',
            'email' => 'editor@example.com',
            'password' => Hash::make("editor12345"),
        ]);
        $editor->assignRole(RoleEnum::EDITOR->value);

        // Create Moderator
        $moderator = User::create([
            'name' => 'Moderator',
            'email' => 'moderator@example.com',
            'password' => Hash::make("moderator12345"),
        ]);
        $moderator->assignRole(RoleEnum::MODERATOR->value);
    }
}
