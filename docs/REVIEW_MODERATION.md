# Review & Moderation System

## Overview

Content moderation system with toggleable approval workflows for posts and comments.

---

## Moderation Settings Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModerationSetting extends Model
{
    protected $fillable = ['setting_key', 'setting_value', 'description'];

    protected $casts = ['setting_value' => 'boolean'];

    public static function get(string $key, bool $default = false): bool
    {
        return static::where('setting_key', $key)->value('setting_value') ?? $default;
    }

    public static function set(string $key, bool $value): void
    {
        static::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
    }
}
```

**Default Settings**:

- `posts_require_approval` - New posts need approval
- `comments_require_approval` - New comments need approval
- `auto_approve_verified_users` - Skip approval for verified users
- `enable_spam_detection` - Auto-detect spam

---

## Post Approval Workflow

### Creating Post with Approval

```php
// In PostController@store
public function store(Request $request)
{
    $requiresApproval = ModerationSetting::get('posts_require_approval');
    $isVerified = $request->user()->is_verified;
    $autoApprove = ModerationSetting::get('auto_approve_verified_users');

    $post = Post::create([
        'user_id' => $request->user()->id,
        'title' => $request->title,
        'content' => $request->content,
        'status' => ($requiresApproval && !($isVerified && $autoApprove)) ? 'pending' : 'published',
        'requires_approval' => $requiresApproval,
        'published_at' => ($requiresApproval && !($isVerified && $autoApprove)) ? null : now(),
    ]);

    if ($post->status === 'pending') {
        // Notify moderators
        $moderators = User::role(['admin', 'moderator'])->get();
        Notification::send($moderators, new ContentPendingApproval($post));
    }

    return redirect()->route('posts.show', $post);
}
```

### Approval Actions

```php
// In Admin\PostController
public function approve(Post $post)
{
    $post->update([
        'status' => 'published',
        'published_at' => now(),
        'approved_at' => now(),
        'approved_by' => auth()->id(),
    ]);

    $post->user->notify(new ContentApproved($post));

    return back()->with('success', 'Post approved');
}

public function reject(Post $post, Request $request)
{
    $request->validate(['reason' => 'required|min:20']);

    $post->update(['status' => 'rejected']);

    $post->user->notify(new ContentRejected($post, $request->reason));

    return back()->with('success', 'Post rejected');
}
```

---

## Comment Approval

```php
// In CommentController@store
public function store(Request $request, Post $post)
{
    $requiresApproval = ModerationSetting::get('comments_require_approval');
    $isVerified = $request->user()->is_verified;
    $autoApprove = ModerationSetting::get('auto_approve_verified_users');

    $comment = $post->comments()->create([
        'user_id' => $request->user()->id,
        'content' => $request->content,
        'parent_id' => $request->parent_id,
        'approved' => !$requiresApproval || ($isVerified && $autoApprove),
    ]);

    if (!$comment->approved) {
        $moderators = User::role(['admin', 'moderator'])->get();
        Notification::send($moderators, new CommentPendingApproval($comment));
    }

    return back();
}
```

---

## Moderation Queue

```php
// In Admin\ModerationController
public function posts()
{
    $posts = Post::where('status', 'pending')
        ->with('user', 'category')
        ->latest()
        ->paginate(20);

    return inertia('Admin/Moderation/Posts', compact('posts'));
}

public function comments()
{
    $comments = Comment::where('approved', false)
        ->with('user', 'post')
        ->latest()
        ->paginate(20);

    return inertia('Admin/Moderation/Comments', compact('comments'));
}
```

---

## Spam Detection Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;

class SpamDetection
{
    private $spamKeywords = ['spam', 'casino', 'viagra', 'lottery'];

    public function handle($request, Closure $next)
    {
        if (!ModerationSetting::get('enable_spam_detection')) {
            return $next($request);
        }

        $content = $request->input('content', '');

        // Check spam keywords
        foreach ($this->spamKeywords as $keyword) {
            if (stripos($content, $keyword) !== false) {
                return response()->json(['error' => 'Content flagged as spam'], 422);
            }
        }

        // Check excessive links
        if (substr_count($content, 'http') > 3) {
            return response()->json(['error' => 'Too many links'], 422);
        }

        return $next($request);
    }
}
```

---

## Admin Settings Page

```tsx
// resources/js/Pages/Admin/Settings/Moderation.tsx
import { useForm } from '@inertiajs/react';

export default function ModerationSettings({ settings }) {
    const { data, setData, post, processing } = useForm(settings);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings/moderation');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold">Moderation Settings</h2>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={data.posts_require_approval}
                    onChange={(e) =>
                        setData('posts_require_approval', e.target.checked)
                    }
                />
                <span>Require approval for new posts</span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={data.comments_require_approval}
                    onChange={(e) =>
                        setData('comments_require_approval', e.target.checked)
                    }
                />
                <span>Require approval for new comments</span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={data.auto_approve_verified_users}
                    onChange={(e) =>
                        setData('auto_approve_verified_users', e.target.checked)
                    }
                />
                <span>Auto-approve verified users</span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={data.enable_spam_detection}
                    onChange={(e) =>
                        setData('enable_spam_detection', e.target.checked)
                    }
                />
                <span>Enable spam detection</span>
            </label>

            <button
                type="submit"
                disabled={processing}
                className="rounded bg-blue-600 px-6 py-2 text-white"
            >
                Save Settings
            </button>
        </form>
    );
}
```

---

## Bulk Actions

```php
// In Admin\ModerationController
public function bulkApprove(Request $request)
{
    $ids = $request->input('ids', []);

    Post::whereIn('id', $ids)->update([
        'status' => 'published',
        'published_at' => now(),
        'approved_at' => now(),
        'approved_by' => auth()->id(),
    ]);

    return back()->with('success', count($ids) . ' posts approved');
}

public function bulkReject(Request $request)
{
    $ids = $request->input('ids', []);

    Post::whereIn('id', $ids)->update(['status' => 'rejected']);

    return back()->with('success', count($ids) . ' posts rejected');
}
```

---

**End of Documentation**
