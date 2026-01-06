<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\EditorMediaController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostPageController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PlatformSettingsController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\Public\AuthorController as PublicAuthorController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PostController as PublicPostController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\ShopController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RulesController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');

// Blog Routes
Route::get('/posts', [PublicPostController::class, 'index'])->name('public.posts.index');
Route::get('/post/{slug}', [PublicPostController::class, 'show'])->name('public.posts.show');

// Post Interactions (authenticated)
Route::middleware(['auth'])->group(function () {
    Route::post('/post/{post:id}/like', [PublicPostController::class, 'toggleLike'])->name('public.posts.like');
    Route::post('/post/{post:id}/bookmark', [PublicPostController::class, 'toggleBookmark'])->name('public.posts.bookmark');
    Route::post('/post/{post:id}/comments', [PublicPostController::class, 'storeComment'])->name('public.posts.comment');
});
Route::get('/category/{slug}', [PublicPostController::class, 'category'])->name('public.category.show');

// Authors Routes
Route::get('/authors', [PublicAuthorController::class, 'index'])->name('public.authors.index');
Route::get('/author/{slug}', [PublicAuthorController::class, 'show'])->name('public.authors.show');
Route::get('/@{username}', [PublicAuthorController::class, 'userProfile'])->name('public.users.profile');
Route::get('/user/{user}', [PublicAuthorController::class, 'userProfileById'])->name('public.users.profile.id');

// Shop Routes
Route::get('/shop', [ShopController::class, 'index'])->name('public.shop.index');
Route::get('/product/{slug}', [ShopController::class, 'show'])->name('public.shop.show');
Route::get('/product-category/{slug}', [ShopController::class, 'category'])->name('public.product-category.show');

// Static Pages
Route::get('/about', [PageController::class, 'about'])->name('public.about');
Route::get('/contact', [PageController::class, 'contact'])->name('public.contact');
Route::post('/contact', [PageController::class, 'submitContact'])->name('public.contact.submit');
Route::get('/terms', [PageController::class, 'terms'])->name('public.terms');
Route::get('/privacy', [PageController::class, 'privacy'])->name('public.privacy');
Route::get('/seller-rules', [PageController::class, 'sellerRules'])->name('public.seller-rules');
Route::get('/author-rules', [PageController::class, 'authorRules'])->name('public.author-rules');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

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
    Route::post('posts/{id}/restore', [PostController::class, 'restore'])->name('posts.restore');
    Route::delete('posts/{id}/force-delete', [PostController::class, 'forceDelete'])->name('posts.forceDelete');

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

    // Wishlist
    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('wishlist/{product:id}/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::delete('wishlist/{product:id}', [WishlistController::class, 'remove'])->name('wishlist.remove');
    Route::get('wishlist/{product:id}/check', [WishlistController::class, 'check'])->name('wishlist.check');

    // Bookmarks
    Route::get('bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::delete('bookmarks/{bookmark}', [BookmarkController::class, 'destroy'])->name('bookmarks.destroy');

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
    Route::post('moderation/products/{product}/approve', [ModerationController::class, 'approveProduct'])->name('moderation.products.approve');
    Route::post('moderation/products/{product}/reject', [ModerationController::class, 'rejectProduct'])->name('moderation.products.reject');
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

    // Product Categories (Admin)
    Route::get('product-categories', [ProductCategoryController::class, 'index'])->name('product-categories.index');
    Route::get('product-categories/create', [ProductCategoryController::class, 'create'])->name('product-categories.create');
    Route::post('product-categories', [ProductCategoryController::class, 'store'])->name('product-categories.store');
    Route::get('product-categories/{product_category}/edit', [ProductCategoryController::class, 'edit'])->name('product-categories.edit');
    Route::put('product-categories/{product_category}', [ProductCategoryController::class, 'update'])->name('product-categories.update');
    Route::delete('product-categories/{product_category}', [ProductCategoryController::class, 'destroy'])->name('product-categories.destroy');

    // Products (Seller)
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Product Reviews (Admin)
    Route::get('product-reviews', [ProductReviewController::class, 'index'])->name('product-reviews.index');
    Route::delete('product-reviews/{product_review}', [ProductReviewController::class, 'destroy'])->name('product-reviews.destroy');

    // Seller Orders
    Route::get('orders', [OrderController::class, 'sellerIndex'])->name('seller.orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('seller.orders.show');
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('seller.orders.status');
    Route::post('orders/{order}/paid', [OrderController::class, 'markPaid'])->name('seller.orders.paid');

    // Seller Transactions
    Route::get('transactions', [TransactionController::class, 'index'])->name('seller.transactions.index');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('seller.transactions.show');
    Route::post('transactions/{transaction}/paid', [TransactionController::class, 'markPaid'])->name('seller.transactions.paid');
    Route::post('transactions/{transaction}/refund', [TransactionController::class, 'refund'])->name('seller.transactions.refund');

    // Payment Methods (Admin)
    Route::get('payment-methods', [PaymentMethodController::class, 'index'])->name('payment-methods.index');
    Route::post('payment-methods', [PaymentMethodController::class, 'store'])->name('payment-methods.store');
    Route::put('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('payment-methods.update');
    Route::delete('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');

    // Rules (Public - for all authenticated users)
    Route::get('rules', [RulesController::class, 'index'])->name('rules.index');

    // Platform Settings (Super Admin only)
    Route::get('settings', [PlatformSettingsController::class, 'index'])->name('platform-settings.index');
    Route::post('settings/commission', [PlatformSettingsController::class, 'updateCommission'])->name('platform-settings.commission');
    Route::post('settings/seller-rules', [PlatformSettingsController::class, 'updateSellerRules'])->name('platform-settings.seller-rules');
    Route::post('settings/author-rules', [PlatformSettingsController::class, 'updateAuthorRules'])->name('platform-settings.author-rules');
    Route::post('settings/terms-of-service', [PlatformSettingsController::class, 'updateTermsOfService'])->name('platform-settings.terms-of-service');
    Route::post('settings/privacy-policy', [PlatformSettingsController::class, 'updatePrivacyPolicy'])->name('platform-settings.privacy-policy');
});

// Cart Routes (guest and authenticated users)
Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart', [CartController::class, 'store'])->name('cart.store');
Route::put('cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
Route::delete('cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
Route::get('cart/count', [CartController::class, 'count'])->name('cart.count');

// Checkout (guest and authenticated users)
Route::get('checkout', [OrderController::class, 'showCheckout'])->name('checkout.show');
Route::post('checkout', [OrderController::class, 'checkout'])->name('checkout');

// Orders (authenticated users)
Route::middleware(['auth'])->group(function () {
    Route::get('my-orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('my-orders/{order}', [OrderController::class, 'buyerShow'])->name('orders.show');
    Route::post('my-orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
});

require __DIR__.'/settings.php';
