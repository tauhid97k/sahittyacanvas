<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, InteractsWithMedia, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'bio',
        'avatar',
        'banner',
        'is_verified',
        'reputation_score',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_verified' => 'boolean',
            'reputation_score' => 'integer',
            'posts_count' => 'integer',
            'followers_count' => 'integer',
            'following_count' => 'integer',
        ];
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'username', 'bio', 'is_verified'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('banner')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10);

        $this->addMediaConversion('medium')
            ->width(400)
            ->height(400);
    }

    /**
     * Get roles
     */
    public function getRolesAttribute()
    {
        return $this->roles()->pluck('name');
    }

    /**
     * Get permissions via roles
     */
    public function getPermissionsAttribute()
    {
        return $this->getPermissionsViaRoles()->pluck('name');
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get user's posts
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get user's comments
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get user's likes
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get user's bookmarks
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Get user's reading lists
     */
    public function readingLists(): HasMany
    {
        return $this->hasMany(ReadingList::class);
    }

    /**
     * Get user's notification settings
     */
    public function notificationSettings(): HasMany
    {
        return $this->hasMany(NotificationSetting::class);
    }

    /**
     * Get user's reports (as reporter)
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Get followers of this user (polymorphic)
     */
    public function followers(): MorphMany
    {
        return $this->morphMany(Follow::class, 'followable');
    }

    /**
     * Get users/authors this user is following
     */
    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    /**
     * Get posts approved by this user (moderator)
     */
    public function approvedPosts(): HasMany
    {
        return $this->hasMany(Post::class, 'approved_by');
    }

    /**
     * Get reports resolved by this user (moderator)
     */
    public function resolvedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'resolved_by');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if user is following a model
     */
    public function isFollowing(Model $model): bool
    {
        return $this->following()
            ->where('followable_type', get_class($model))
            ->where('followable_id', $model->id)
            ->exists();
    }

    /**
     * Check if user has liked a post
     */
    public function hasLiked(Post $post): bool
    {
        return $this->likes()->where('post_id', $post->id)->exists();
    }

    /**
     * Check if user has bookmarked a post
     */
    public function hasBookmarked(Post $post): bool
    {
        return $this->bookmarks()->where('post_id', $post->id)->exists();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'username';
    }

    /**
     * Get display name
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Get avatar URL
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('avatar', 'thumb') ?: $this->avatar;
    }

    /**
     * Get banner URL
     */
    public function getBannerUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('banner') ?: $this->banner;
    }
}
