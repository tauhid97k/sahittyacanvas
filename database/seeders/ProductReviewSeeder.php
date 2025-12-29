<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if reviews already exist
        if (ProductReview::count() > 0) {
            $this->command->info('Product reviews already exist. Skipping...');
            return;
        }

        // Get delivered orders (only buyers who received products can review)
        $deliveredOrders = Order::where('status', OrderStatus::DELIVERED)
            ->with(['items.product', 'buyer'])
            ->get();

        if ($deliveredOrders->isEmpty()) {
            $this->command->warn('No delivered orders found. Please run OrderSeeder first.');
            return;
        }

        $reviewTexts = [
            5 => [
                'Excellent product! Highly recommended.',
                'Amazing quality, exceeded my expectations!',
                'Best purchase I\'ve made. Very satisfied.',
                'Perfect! Will buy again.',
                'Outstanding quality and fast delivery.',
            ],
            4 => [
                'Good product, minor issues but overall satisfied.',
                'Nice quality, worth the price.',
                'Pretty good, would recommend.',
                'Satisfied with the purchase.',
                'Good value for money.',
            ],
            3 => [
                'Average product, nothing special.',
                'It\'s okay, expected better quality.',
                'Decent but could be improved.',
                'Fair product for the price.',
                'Not bad, not great either.',
            ],
            2 => [
                'Below expectations, not very satisfied.',
                'Quality could be much better.',
                'Disappointed with this purchase.',
                'Not worth the price.',
                'Would not recommend.',
            ],
            1 => [
                'Very poor quality, waste of money.',
                'Terrible product, do not buy.',
                'Completely unsatisfied.',
                'Product arrived damaged.',
                'Not as described at all.',
            ],
        ];

        $reviewCount = 0;

        foreach ($deliveredOrders as $order) {
            // 70% chance of leaving a review
            if (rand(1, 100) > 70) {
                continue;
            }

            foreach ($order->items as $item) {
                // Check if review already exists
                $exists = ProductReview::where('product_id', $item->product_id)
                    ->where('user_id', $order->user_id)
                    ->where('order_id', $order->id)
                    ->exists();

                if ($exists) {
                    continue;
                }

                // 80% chance of reviewing each product in the order
                if (rand(1, 100) > 80) {
                    continue;
                }

                // Weight ratings towards higher values (more realistic)
                $ratingWeights = [5 => 40, 4 => 30, 3 => 15, 2 => 10, 1 => 5];
                $rating = $this->weightedRandom($ratingWeights);

                // 70% chance of including review text
                $reviewText = rand(1, 100) <= 70 
                    ? $reviewTexts[$rating][array_rand($reviewTexts[$rating])]
                    : null;

                ProductReview::create([
                    'product_id' => $item->product_id,
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'rating' => $rating,
                    'review' => $reviewText,
                    'is_verified_purchase' => true,
                    'created_at' => $order->delivered_at?->addDays(rand(1, 7)) ?? now(),
                ]);

                $reviewCount++;
            }
        }

        $this->command->info("Created $reviewCount product reviews.");
    }

    /**
     * Get a weighted random value
     */
    private function weightedRandom(array $weights): int
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        
        foreach ($weights as $value => $weight) {
            $random -= $weight;
            if ($random <= 0) {
                return $value;
            }
        }
        
        return array_key_first($weights);
    }
}
