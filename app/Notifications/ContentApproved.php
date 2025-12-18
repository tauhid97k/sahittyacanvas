<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContentApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post,
        public string $contentType = 'post'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your {$this->contentType} has been approved")
            ->line("Your {$this->contentType} \"{$this->post->title}\" has been approved and is now live.")
            ->action('View Post', url("/posts/{$this->post->slug}"))
            ->line('Thank you for your contribution!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'content_approved',
            'title' => 'Content Approved',
            'message' => "Your {$this->contentType} \"{$this->post->title}\" has been approved",
            'post_id' => $this->post->id,
            'post_title' => $this->post->title,
            'post_slug' => $this->post->slug,
            'content_type' => $this->contentType,
            'action_url' => "/posts/{$this->post->slug}",
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
