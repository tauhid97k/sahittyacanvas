<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommissionPercentageChanged extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public float $oldPercentage,
        public float $newPercentage,
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
            ->subject('Platform Commission Rate Updated')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The platform commission rate has been updated.')
            ->line("Previous rate: {$this->oldPercentage}%")
            ->line("New rate: {$this->newPercentage}%")
            ->line('This change is effective immediately for all new orders.')
            ->action('View Dashboard', url('/dashboard'))
            ->line('Thank you for being a seller on our platform!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'commission_changed',
            'title' => 'Platform Commission Updated',
            'message' => "Platform commission rate changed from {$this->oldPercentage}% to {$this->newPercentage}%",
            'old_percentage' => $this->oldPercentage,
            'new_percentage' => $this->newPercentage,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'commission_changed',
            'title' => 'Platform Commission Updated',
            'message' => "Platform commission rate changed from {$this->oldPercentage}% to {$this->newPercentage}%",
            'old_percentage' => $this->oldPercentage,
            'new_percentage' => $this->newPercentage,
        ]);
    }
}
