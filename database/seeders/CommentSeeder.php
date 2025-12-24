<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users
        $admin = User::where('email', 'admin@example.com')->first();
        $user = User::where('email', 'user@example.com')->first();
        $author = User::where('email', 'author@example.com')->first();
        $editor = User::where('email', 'editor@example.com')->first();
        $moderator = User::where('email', 'moderator@example.com')->first();

        // Get published posts
        $posts = Post::where('status', 'published')->take(10)->get();

        if ($posts->isEmpty()) {
            $this->command->warn('No published posts found. Skipping comment seeding.');
            return;
        }

        $users = collect([$admin, $user, $author, $editor, $moderator])->filter();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Skipping comment seeding.');
            return;
        }

        // Sample comments in Bengali and English
        $sampleComments = [
            'অসাধারণ লেখা! অনেক কিছু শিখলাম।',
            'চমৎকার বিশ্লেষণ। ধন্যবাদ শেয়ার করার জন্য।',
            'এই বিষয়ে আরও লেখা চাই।',
            'খুবই তথ্যবহুল। বুকমার্ক করে রাখলাম।',
            'লেখকের প্রতি শ্রদ্ধা রইল।',
            'এত সুন্দর করে লেখার জন্য ধন্যবাদ।',
            'আমার মতামত একটু ভিন্ন, তবে লেখাটি ভালো লাগলো।',
            'এই বিষয়ে আমি আগে জানতাম না। অনেক ধন্যবাদ।',
            'লেখাটি পড়ে অনেক অনুপ্রাণিত হলাম।',
            'আরও এমন লেখা চাই।',
            'Great article! Very informative.',
            'Thanks for sharing this wonderful piece.',
            'I learned a lot from this post.',
            'Looking forward to more content like this.',
            'Beautifully written. Keep up the good work!',
        ];

        // Sample replies
        $sampleReplies = [
            'ধন্যবাদ আপনার মতামতের জন্য!',
            'আপনার সাথে একমত।',
            'হ্যাঁ, আমিও তাই মনে করি।',
            'সুন্দর পয়েন্ট!',
            'Thank you for your feedback!',
            'I agree with you.',
            'Great point!',
        ];

        $moderationStatuses = ['approved', 'pending', 'auto'];

        foreach ($posts as $post) {
            // Create 2-5 root comments per post
            $commentCount = rand(2, 5);

            for ($i = 0; $i < $commentCount; $i++) {
                $randomUser = $users->random();
                $isApproved = rand(0, 1) === 1;
                $status = $isApproved 
                    ? ($moderationStatuses[array_rand(['approved', 'auto'])] ?? 'approved')
                    : 'pending';

                $comment = Comment::create([
                    'post_id' => $post->id,
                    'user_id' => $randomUser->id,
                    'content' => $sampleComments[array_rand($sampleComments)],
                    'is_approved' => $isApproved,
                    'moderation_status' => $status,
                    'created_at' => now()->subDays(rand(1, 30))->subHours(rand(1, 23)),
                ]);

                // Add 0-2 replies to some comments
                if (rand(0, 1) === 1) {
                    $replyCount = rand(1, 2);
                    for ($j = 0; $j < $replyCount; $j++) {
                        $replyUser = $users->random();
                        $replyApproved = rand(0, 1) === 1;
                        $replyStatus = $replyApproved 
                            ? ($moderationStatuses[array_rand(['approved', 'auto'])] ?? 'approved')
                            : 'pending';

                        Comment::create([
                            'post_id' => $post->id,
                            'user_id' => $replyUser->id,
                            'parent_id' => $comment->id,
                            'content' => $sampleReplies[array_rand($sampleReplies)],
                            'is_approved' => $replyApproved,
                            'moderation_status' => $replyStatus,
                            'created_at' => $comment->created_at->addHours(rand(1, 48)),
                        ]);

                        // Update replies count
                        $comment->increment('replies_count');
                    }
                }
            }
        }

        $this->command->info('Comments seeded successfully!');
    }
}
