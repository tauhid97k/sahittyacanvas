<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Toggle follow/unfollow for a user or author.
     * 
     * @param string $type - 'user' or 'author'
     * @param int $id - The ID of the user or author to follow
     */
    public function toggle(Request $request, string $type, int $id): RedirectResponse
    {
        $user = $request->user();

        // Determine the followable model
        $followableType = match ($type) {
            'user' => User::class,
            'author' => Author::class,
            default => null,
        };

        if (!$followableType) {
            return back()->with('error', 'Invalid follow type.');
        }

        // Verify the target exists
        $target = $followableType::find($id);
        if (!$target) {
            return back()->with('error', 'Target not found.');
        }

        // Prevent self-follow for users
        if ($followableType === User::class && $id === $user->id) {
            return back()->with('error', 'You cannot follow yourself.');
        }

        // Check if already following
        $existingFollow = Follow::where('follower_id', $user->id)
            ->where('followable_type', $followableType)
            ->where('followable_id', $id)
            ->first();

        if ($existingFollow) {
            $existingFollow->delete();
            return back()->with('success', 'আনফলো করা হয়েছে।');
        }

        Follow::create([
            'follower_id' => $user->id,
            'followable_type' => $followableType,
            'followable_id' => $id,
        ]);

        return back()->with('success', 'ফলো করা হয়েছে।');
    }
}
