<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EditorMediaController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostPageController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard/index');
    })->name('dashboard');

    // Categories
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Authors
    Route::get('authors', [AuthorController::class, 'index'])->name('authors.index');
    Route::get('authors/create', [AuthorController::class, 'create'])->name('authors.create');
    Route::post('authors', [AuthorController::class, 'store'])->name('authors.store');
    Route::get('authors/{author}/edit', [AuthorController::class, 'edit'])->name('authors.edit');
    Route::put('authors/{author}', [AuthorController::class, 'update'])->name('authors.update');
    Route::delete('authors/{author}', [AuthorController::class, 'destroy'])->name('authors.destroy');

    // Posts
    Route::get('posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::get('posts/{post}/edit', [PostController::class, 'edit'])->name('posts.edit');
    Route::put('posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    // Post Pages (multi-page support)
    Route::post('posts/{post}/pages', [PostPageController::class, 'store'])->name('posts.pages.store');
    Route::put('posts/{post}/pages/{page}', [PostPageController::class, 'update'])->name('posts.pages.update');
    Route::delete('posts/{post}/pages/{page}', [PostPageController::class, 'destroy'])->name('posts.pages.destroy');

    // Editor Media Upload
    Route::post('editor/upload', [EditorMediaController::class, 'upload'])->name('editor.upload');
    Route::delete('editor/image', [EditorMediaController::class, 'destroy'])->name('editor.destroy');

    // Activities
    Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::get('activities/{activity}', [ActivityController::class, 'show'])->name('activities.show');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Likes
    Route::get('likes', [LikeController::class, 'index'])->name('likes.index');
    Route::delete('likes/{like}', [LikeController::class, 'destroy'])->name('likes.destroy');

    // Comments
    Route::get('comments', [CommentController::class, 'index'])->name('comments.index');
    Route::post('comments/{comment}/approve', [CommentController::class, 'approve'])->name('comments.approve');
    Route::post('comments/{comment}/reject', [CommentController::class, 'reject'])->name('comments.reject');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Moderation
    Route::get('moderation', [ModerationController::class, 'index'])->name('moderation.index');
    Route::post('moderation/posts/{post}/approve', [ModerationController::class, 'approvePost'])->name('moderation.posts.approve');
    Route::post('moderation/posts/{post}/reject', [ModerationController::class, 'rejectPost'])->name('moderation.posts.reject');
    Route::post('moderation/comments/{comment}/approve', [ModerationController::class, 'approveComment'])->name('moderation.comments.approve');
    Route::post('moderation/comments/{comment}/reject', [ModerationController::class, 'rejectComment'])->name('moderation.comments.reject');
    Route::post('moderation/settings', [ModerationController::class, 'updateSettings'])->name('moderation.settings.update');

    // Users
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user:id}', [UserController::class, 'show'])->name('users.show');
    Route::put('users/{user:id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user:id}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('users/{user:id}/ban', [UserController::class, 'ban'])->name('users.ban');
    Route::post('users/{user:id}/unban', [UserController::class, 'unban'])->name('users.unban');

    // Roles
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::get('roles/{role}/permissions', [RoleController::class, 'permissions'])->name('roles.permissions');
    Route::put('roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('roles.permissions.update');
});

require __DIR__.'/settings.php';
