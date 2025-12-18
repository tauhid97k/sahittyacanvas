<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users to create notifications for each
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Skipping notification seeder.');
            return;
        }

        $post = Post::first();
        $postTitle = $post?->title ?? 'Sample Post';
        $postSlug = $post?->slug ?? 'sample-post';
        $postId = $post?->id ?? 1;

        $notifications = [
            [
                'type' => 'post_published',
                'title' => 'New Post Published',
                'message' => 'John Doe published "The Art of Bengali Poetry"',
                'post_id' => $postId,
                'post_title' => 'The Art of Bengali Poetry',
                'post_slug' => 'the-art-of-bengali-poetry',
                'user_id' => 2,
                'user_name' => 'John Doe',
                'user_avatar' => null,
                'action_url' => $post ? '/dashboard/posts/' . $postSlug : null,
            ],
            [
                'type' => 'post_liked',
                'title' => 'Post Liked',
                'message' => 'Sarah liked your post "' . $postTitle . '"',
                'post_id' => $postId,
                'post_title' => $postTitle,
                'post_slug' => $postSlug,
                'user_id' => 3,
                'user_name' => 'Sarah',
                'user_avatar' => null,
                'action_url' => $post ? '/dashboard/posts/' . $postSlug : null,
            ],
            [
                'type' => 'post_commented',
                'title' => 'New Comment',
                'message' => 'Mike commented on "' . $postTitle . '"',
                'post_id' => $postId,
                'post_title' => $postTitle,
                'post_slug' => $postSlug,
                'comment_id' => 1,
                'user_id' => 4,
                'user_name' => 'Mike',
                'user_avatar' => null,
                'action_url' => $post ? '/dashboard/posts/' . $postSlug : null,
            ],
            [
                'type' => 'user_followed',
                'title' => 'New Follower',
                'message' => 'Emily started following you',
                'user_id' => 5,
                'user_name' => 'Emily',
                'user_avatar' => null,
                'action_url' => '/dashboard/users',
            ],
            [
                'type' => 'content_approved',
                'title' => 'Content Approved',
                'message' => 'Your post "' . $postTitle . '" has been approved',
                'post_id' => $postId,
                'post_title' => $postTitle,
                'post_slug' => $postSlug,
                'content_type' => 'post',
                'action_url' => $post ? '/dashboard/posts/' . $postSlug : null,
            ],
            [
                'type' => 'system',
                'title' => 'Welcome to Sahittyacanvas!',
                'message' => 'Thank you for joining our literary community.',
                'action_url' => '/dashboard',
            ],
        ];

        $totalCreated = 0;
        foreach ($users as $user) {
            foreach ($notifications as $index => $data) {
                $user->notifications()->create([
                    'id' => Str::uuid(),
                    'type' => 'App\\Notifications\\' . Str::studly($data['type']),
                    'data' => $data,
                    'read_at' => $index > 2 ? now() : null, // First 3 are unread
                    'created_at' => now()->subMinutes($index * 30),
                ]);
                $totalCreated++;
            }
        }

        $this->command->info("Created {$totalCreated} demo notifications for {$users->count()} users.");
    }
}
