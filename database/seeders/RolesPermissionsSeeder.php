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

        // Create Permissions with groups
        $permissions = [
            // Dashboard permissions
            ['name' => PermissionEnum::VIEW_DASHBOARD->value, 'group' => 'DASHBOARD'],

            // User permissions
            ['name' => PermissionEnum::LIST_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::VIEW_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::CREATE_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::EDIT_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::DELETE_USER->value, 'group' => 'USER'],
            ['name' => PermissionEnum::BAN_USER->value, 'group' => 'USER'],

            // Role permissions
            ['name' => PermissionEnum::LIST_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::VIEW_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::CREATE_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::EDIT_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::DELETE_ROLE->value, 'group' => 'ROLE'],
            ['name' => PermissionEnum::MANAGE_ROLE_PERMISSIONS->value, 'group' => 'ROLE'],

            // Post Category permissions
            ['name' => PermissionEnum::LIST_CATEGORY->value, 'group' => 'CATEGORY'],
            ['name' => PermissionEnum::CREATE_CATEGORY->value, 'group' => 'CATEGORY'],
            ['name' => PermissionEnum::EDIT_CATEGORY->value, 'group' => 'CATEGORY'],
            ['name' => PermissionEnum::DELETE_CATEGORY->value, 'group' => 'CATEGORY'],

            // Author permissions
            ['name' => PermissionEnum::LIST_AUTHOR->value, 'group' => 'AUTHOR'],
            ['name' => PermissionEnum::CREATE_AUTHOR->value, 'group' => 'AUTHOR'],
            ['name' => PermissionEnum::EDIT_AUTHOR->value, 'group' => 'AUTHOR'],
            ['name' => PermissionEnum::DELETE_AUTHOR->value, 'group' => 'AUTHOR'],

            // Post permissions
            ['name' => PermissionEnum::LIST_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::VIEW_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::CREATE_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::EDIT_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::DELETE_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::RESTORE_POST->value, 'group' => 'POST'],
            ['name' => PermissionEnum::FORCE_DELETE_POST->value, 'group' => 'POST'],

            // Comment permissions
            ['name' => PermissionEnum::LIST_COMMENT->value, 'group' => 'COMMENT'],
            ['name' => PermissionEnum::APPROVE_COMMENT->value, 'group' => 'COMMENT'],
            ['name' => PermissionEnum::REJECT_COMMENT->value, 'group' => 'COMMENT'],
            ['name' => PermissionEnum::DELETE_COMMENT->value, 'group' => 'COMMENT'],

            // Moderation permissions
            ['name' => PermissionEnum::LIST_MODERATION->value, 'group' => 'MODERATION'],
            ['name' => PermissionEnum::APPROVE_POST->value, 'group' => 'MODERATION'],
            ['name' => PermissionEnum::REJECT_POST->value, 'group' => 'MODERATION'],
            ['name' => PermissionEnum::MANAGE_MODERATION_SETTINGS->value, 'group' => 'MODERATION'],

            // Product Category permissions (Admin)
            ['name' => PermissionEnum::LIST_PRODUCT_CATEGORY->value, 'group' => 'PRODUCT_CATEGORY'],
            ['name' => PermissionEnum::CREATE_PRODUCT_CATEGORY->value, 'group' => 'PRODUCT_CATEGORY'],
            ['name' => PermissionEnum::EDIT_PRODUCT_CATEGORY->value, 'group' => 'PRODUCT_CATEGORY'],
            ['name' => PermissionEnum::DELETE_PRODUCT_CATEGORY->value, 'group' => 'PRODUCT_CATEGORY'],

            // Product permissions (Seller)
            ['name' => PermissionEnum::LIST_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::VIEW_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::CREATE_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::EDIT_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::DELETE_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::APPROVE_PRODUCT->value, 'group' => 'PRODUCT'],
            ['name' => PermissionEnum::REJECT_PRODUCT->value, 'group' => 'PRODUCT'],

            // Product Review permissions
            ['name' => PermissionEnum::LIST_PRODUCT_REVIEW->value, 'group' => 'PRODUCT_REVIEW'],
            ['name' => PermissionEnum::DELETE_PRODUCT_REVIEW->value, 'group' => 'PRODUCT_REVIEW'],

            // Order permissions
            ['name' => PermissionEnum::LIST_ORDER->value, 'group' => 'ORDER'],
            ['name' => PermissionEnum::VIEW_ORDER->value, 'group' => 'ORDER'],
            ['name' => PermissionEnum::UPDATE_ORDER_STATUS->value, 'group' => 'ORDER'],
            ['name' => PermissionEnum::CANCEL_ORDER->value, 'group' => 'ORDER'],
            ['name' => PermissionEnum::MARK_ORDER_PAID->value, 'group' => 'ORDER'],

            // Transaction permissions
            ['name' => PermissionEnum::LIST_TRANSACTION->value, 'group' => 'TRANSACTION'],
            ['name' => PermissionEnum::VIEW_TRANSACTION->value, 'group' => 'TRANSACTION'],
            ['name' => PermissionEnum::MARK_TRANSACTION_PAID->value, 'group' => 'TRANSACTION'],
            ['name' => PermissionEnum::REFUND_TRANSACTION->value, 'group' => 'TRANSACTION'],

            // Payment Method permissions (Admin)
            ['name' => PermissionEnum::LIST_PAYMENT_METHOD->value, 'group' => 'PAYMENT_METHOD'],
            ['name' => PermissionEnum::CREATE_PAYMENT_METHOD->value, 'group' => 'PAYMENT_METHOD'],
            ['name' => PermissionEnum::EDIT_PAYMENT_METHOD->value, 'group' => 'PAYMENT_METHOD'],
            ['name' => PermissionEnum::DELETE_PAYMENT_METHOD->value, 'group' => 'PAYMENT_METHOD'],

            // Platform Settings permissions (Super Admin)
            ['name' => PermissionEnum::LIST_PLATFORM_SETTINGS->value, 'group' => 'PLATFORM_SETTINGS'],
            ['name' => PermissionEnum::EDIT_PLATFORM_SETTINGS->value, 'group' => 'PLATFORM_SETTINGS'],

            // Activity permissions
            ['name' => PermissionEnum::LIST_ACTIVITY->value, 'group' => 'ACTIVITY'],
            ['name' => PermissionEnum::VIEW_ACTIVITY->value, 'group' => 'ACTIVITY'],
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'name' => $permission['name'],
                'group' => $permission['group'],
            ]);
        }

        // Create Roles
        $superRole = Role::create(['name' => RoleEnum::SUPER->value]);
        $adminRole = Role::create(['name' => RoleEnum::ADMIN->value]);
        $userRole = Role::create(['name' => RoleEnum::USER->value]);
        $authorRole = Role::create(['name' => RoleEnum::AUTHOR->value]);
        $editorRole = Role::create(['name' => RoleEnum::EDITOR->value]);
        $moderatorRole = Role::create(['name' => RoleEnum::MODERATOR->value]);
        $sellerRole = Role::create(['name' => RoleEnum::SELLER->value]);

        // Assign permissions to roles
        // SUPER gets all permissions (handled by Gate::before in AuthServiceProvider)

        // ADMIN permissions - full access except platform settings
        $adminRole->givePermissionTo([
            // Dashboard
            PermissionEnum::VIEW_DASHBOARD->value,
            // Users
            PermissionEnum::LIST_USER->value,
            PermissionEnum::VIEW_USER->value,
            PermissionEnum::CREATE_USER->value,
            PermissionEnum::EDIT_USER->value,
            PermissionEnum::DELETE_USER->value,
            PermissionEnum::BAN_USER->value,
            // Roles
            PermissionEnum::LIST_ROLE->value,
            PermissionEnum::VIEW_ROLE->value,
            PermissionEnum::CREATE_ROLE->value,
            PermissionEnum::EDIT_ROLE->value,
            PermissionEnum::DELETE_ROLE->value,
            PermissionEnum::MANAGE_ROLE_PERMISSIONS->value,
            // Categories
            PermissionEnum::LIST_CATEGORY->value,
            PermissionEnum::CREATE_CATEGORY->value,
            PermissionEnum::EDIT_CATEGORY->value,
            PermissionEnum::DELETE_CATEGORY->value,
            // Authors
            PermissionEnum::LIST_AUTHOR->value,
            PermissionEnum::CREATE_AUTHOR->value,
            PermissionEnum::EDIT_AUTHOR->value,
            PermissionEnum::DELETE_AUTHOR->value,
            // Posts
            PermissionEnum::LIST_POST->value,
            PermissionEnum::VIEW_POST->value,
            PermissionEnum::CREATE_POST->value,
            PermissionEnum::EDIT_POST->value,
            PermissionEnum::DELETE_POST->value,
            PermissionEnum::RESTORE_POST->value,
            PermissionEnum::FORCE_DELETE_POST->value,
            // Comments
            PermissionEnum::LIST_COMMENT->value,
            PermissionEnum::APPROVE_COMMENT->value,
            PermissionEnum::REJECT_COMMENT->value,
            PermissionEnum::DELETE_COMMENT->value,
            // Moderation
            PermissionEnum::LIST_MODERATION->value,
            PermissionEnum::APPROVE_POST->value,
            PermissionEnum::REJECT_POST->value,
            PermissionEnum::MANAGE_MODERATION_SETTINGS->value,
            // Product Categories
            PermissionEnum::LIST_PRODUCT_CATEGORY->value,
            PermissionEnum::CREATE_PRODUCT_CATEGORY->value,
            PermissionEnum::EDIT_PRODUCT_CATEGORY->value,
            PermissionEnum::DELETE_PRODUCT_CATEGORY->value,
            // Products
            PermissionEnum::LIST_PRODUCT->value,
            PermissionEnum::VIEW_PRODUCT->value,
            PermissionEnum::APPROVE_PRODUCT->value,
            PermissionEnum::REJECT_PRODUCT->value,
            // Product Reviews
            PermissionEnum::LIST_PRODUCT_REVIEW->value,
            PermissionEnum::DELETE_PRODUCT_REVIEW->value,
            // Orders
            PermissionEnum::LIST_ORDER->value,
            PermissionEnum::VIEW_ORDER->value,
            PermissionEnum::UPDATE_ORDER_STATUS->value,
            PermissionEnum::CANCEL_ORDER->value,
            PermissionEnum::MARK_ORDER_PAID->value,
            // Transactions
            PermissionEnum::LIST_TRANSACTION->value,
            PermissionEnum::VIEW_TRANSACTION->value,
            PermissionEnum::MARK_TRANSACTION_PAID->value,
            PermissionEnum::REFUND_TRANSACTION->value,
            // Payment Methods
            PermissionEnum::LIST_PAYMENT_METHOD->value,
            PermissionEnum::CREATE_PAYMENT_METHOD->value,
            PermissionEnum::EDIT_PAYMENT_METHOD->value,
            PermissionEnum::DELETE_PAYMENT_METHOD->value,
            // Activity
            PermissionEnum::LIST_ACTIVITY->value,
            PermissionEnum::VIEW_ACTIVITY->value,
        ]);

        // USER permissions - basic access and own orders
        $userRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            PermissionEnum::LIST_ORDER->value, // Users can view their own orders
            PermissionEnum::VIEW_ORDER->value,
            PermissionEnum::CANCEL_ORDER->value,
        ]);

        // AUTHOR permissions - can manage own posts
        $authorRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            // Categories (needed to see categories for post creation)
            PermissionEnum::LIST_CATEGORY->value,
            // Authors (needed to see authors list)
            PermissionEnum::LIST_AUTHOR->value,
            // Posts
            PermissionEnum::LIST_POST->value,
            PermissionEnum::VIEW_POST->value,
            PermissionEnum::CREATE_POST->value,
            PermissionEnum::EDIT_POST->value,
            PermissionEnum::DELETE_POST->value,
            // Comments (needed to see comments on own posts)
            PermissionEnum::LIST_COMMENT->value,
        ]);

        // EDITOR permissions - can manage posts and categories
        $editorRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            // Categories
            PermissionEnum::LIST_CATEGORY->value,
            PermissionEnum::CREATE_CATEGORY->value,
            PermissionEnum::EDIT_CATEGORY->value,
            PermissionEnum::DELETE_CATEGORY->value,
            // Authors
            PermissionEnum::LIST_AUTHOR->value,
            PermissionEnum::CREATE_AUTHOR->value,
            PermissionEnum::EDIT_AUTHOR->value,
            PermissionEnum::DELETE_AUTHOR->value,
            // Posts
            PermissionEnum::LIST_POST->value,
            PermissionEnum::VIEW_POST->value,
            PermissionEnum::CREATE_POST->value,
            PermissionEnum::EDIT_POST->value,
            PermissionEnum::DELETE_POST->value,
            PermissionEnum::RESTORE_POST->value,
            // Comments
            PermissionEnum::LIST_COMMENT->value,
        ]);

        // MODERATOR permissions - can moderate content
        $moderatorRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            // Posts
            PermissionEnum::LIST_POST->value,
            PermissionEnum::VIEW_POST->value,
            // Comments
            PermissionEnum::LIST_COMMENT->value,
            PermissionEnum::APPROVE_COMMENT->value,
            PermissionEnum::REJECT_COMMENT->value,
            PermissionEnum::DELETE_COMMENT->value,
            // Moderation
            PermissionEnum::LIST_MODERATION->value,
            PermissionEnum::APPROVE_POST->value,
            PermissionEnum::REJECT_POST->value,
            // Products
            PermissionEnum::LIST_PRODUCT->value,
            PermissionEnum::VIEW_PRODUCT->value,
            PermissionEnum::APPROVE_PRODUCT->value,
            PermissionEnum::REJECT_PRODUCT->value,
            // Product Reviews
            PermissionEnum::LIST_PRODUCT_REVIEW->value,
            PermissionEnum::DELETE_PRODUCT_REVIEW->value,
        ]);

        // SELLER permissions - can manage own products and orders
        $sellerRole->givePermissionTo([
            PermissionEnum::VIEW_DASHBOARD->value,
            // Product Categories (needed to see categories for product creation)
            PermissionEnum::LIST_PRODUCT_CATEGORY->value,
            // Products
            PermissionEnum::LIST_PRODUCT->value,
            PermissionEnum::VIEW_PRODUCT->value,
            PermissionEnum::CREATE_PRODUCT->value,
            PermissionEnum::EDIT_PRODUCT->value,
            PermissionEnum::DELETE_PRODUCT->value,
            // Product Reviews (needed to see reviews on own products)
            PermissionEnum::LIST_PRODUCT_REVIEW->value,
            // Orders
            PermissionEnum::LIST_ORDER->value,
            PermissionEnum::VIEW_ORDER->value,
            PermissionEnum::UPDATE_ORDER_STATUS->value,
            // Transactions
            PermissionEnum::LIST_TRANSACTION->value,
            PermissionEnum::VIEW_TRANSACTION->value,
        ]);

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

        // Create Seller
        $seller = User::create([
            'name' => 'Seller',
            'email' => 'seller@example.com',
            'password' => Hash::make("seller12345"),
        ]);
        $seller->assignRole(RoleEnum::SELLER->value);
    }
}
