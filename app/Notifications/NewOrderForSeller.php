<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to the SELLER when a new order is received.
 */
class NewOrderForSeller extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("নতুন অর্ডার পেয়েছেন: {$this->order->order_number}")
            ->greeting("প্রিয় {$notifiable->name},")
            ->line("আপনি একটি নতুন অর্ডার পেয়েছেন #{$this->order->order_number}।")
            ->line("মোট: {$this->order->formatted_total}")
            ->line("ক্রেতা: {$this->order->buyer?->name}")
            ->action('অর্ডার দেখুন', url("/dashboard/orders/{$this->order->id}"))
            ->line('দয়া করে অর্ডারটি দ্রুত প্রসেস করুন।');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_order',
            'title' => 'নতুন অর্ডার পেয়েছেন',
            'message' => "নতুন অর্ডার #{$this->order->order_number} - {$this->order->formatted_total}",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => $this->order->formatted_total,
            'buyer_name' => $this->order->buyer?->name,
            'action_url' => "/dashboard/orders/{$this->order->id}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
