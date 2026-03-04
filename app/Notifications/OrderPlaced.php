<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to the BUYER when an order is placed.
 */
class OrderPlaced extends Notification implements ShouldQueue
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
            ->subject("অর্ডার নিশ্চিত হয়েছে: {$this->order->order_number}")
            ->greeting("প্রিয় {$notifiable->name},")
            ->line("আপনার অর্ডার #{$this->order->order_number} সফলভাবে গ্রহণ করা হয়েছে।")
            ->line("মোট: {$this->order->formatted_total}")
            ->line("পেমেন্ট পদ্ধতি: {$this->order->payment_method}")
            ->action('অর্ডার দেখুন', url("/my-orders/{$this->order->id}"))
            ->line('আপনার অর্ডার শীঘ্রই প্রসেস করা হবে।');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_placed',
            'title' => 'অর্ডার নিশ্চিত হয়েছে',
            'message' => "অর্ডার #{$this->order->order_number} সফলভাবে গ্রহণ করা হয়েছে।",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => $this->order->formatted_total,
            'action_url' => "/my-orders/{$this->order->id}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
