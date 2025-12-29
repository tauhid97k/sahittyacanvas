<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Skip if orders already exist
        if (Order::count() > 0) {
            $this->command->info('Orders already exist. Skipping...');
            return;
        }

        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Please run ProductSeeder first.');
            return;
        }

        // Get buyers (users without seller role or create some)
        $buyers = User::whereDoesntHave('roles', function ($q) {
            $q->where('name', 'seller');
        })->take(5)->get();

        if ($buyers->isEmpty()) {
            // Create some buyer users
            for ($i = 1; $i <= 3; $i++) {
                $buyers->push(User::factory()->create([
                    'name' => "Buyer $i",
                    'email' => "buyer$i@example.com",
                    'username' => "buyer$i",
                ]));
            }
        }

        $cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];
        $areas = ['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Banani', 'Mohammadpur'];

        $orderStatuses = [
            OrderStatus::PENDING,
            OrderStatus::CONFIRMED,
            OrderStatus::PROCESSING,
            OrderStatus::SHIPPED,
            OrderStatus::DELIVERED,
        ];

        $paymentStatuses = [
            PaymentStatus::UNPAID,
            PaymentStatus::PAID,
        ];

        // Create 20 orders
        for ($i = 0; $i < 20; $i++) {
            $buyer = $buyers->random();
            $numProducts = min(rand(1, 3), $products->count());
            $orderProducts = $products->random($numProducts);
            
            // Ensure it's always a collection
            if (!$orderProducts instanceof \Illuminate\Support\Collection) {
                $orderProducts = collect([$orderProducts]);
            }
            
            // Get seller from first product
            $seller = User::find($orderProducts->first()->user_id);
            
            $subtotal = 0;
            $orderItems = [];

            foreach ($orderProducts as $product) {
                $quantity = rand(1, 3);
                $unitPrice = $product->discounted_price;
                $total = $unitPrice * $quantity;
                $subtotal += $total;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_bn,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ];
            }

            $shippingCost = rand(5000, 15000); // 50-150 taka
            $total = $subtotal + $shippingCost;

            $status = $orderStatuses[array_rand($orderStatuses)];
            $paymentStatus = $status === OrderStatus::DELIVERED 
                ? PaymentStatus::PAID 
                : $paymentStatuses[array_rand($paymentStatuses)];

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'user_id' => $buyer->id,
                'seller_id' => $seller->id,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'payment_method' => 'cod',
                'shipping_name' => $buyer->name,
                'shipping_phone' => '01' . rand(700000000, 999999999),
                'shipping_email' => $buyer->email,
                'shipping_address' => 'House ' . rand(1, 100) . ', Road ' . rand(1, 20),
                'shipping_city' => $cities[array_rand($cities)],
                'shipping_area' => $areas[array_rand($areas)],
                'shipping_postal_code' => (string) rand(1000, 9999),
                'shipped_at' => in_array($status, [OrderStatus::SHIPPED, OrderStatus::DELIVERED]) ? now()->subDays(rand(1, 5)) : null,
                'delivered_at' => $status === OrderStatus::DELIVERED ? now()->subDays(rand(0, 2)) : null,
                'created_at' => now()->subDays(rand(1, 60)),
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    ...$item,
                ]);
            }

            // Update product sales count for delivered orders
            if ($status === OrderStatus::DELIVERED) {
                foreach ($orderItems as $item) {
                    Product::where('id', $item['product_id'])
                        ->increment('sales_count', $item['quantity']);
                }
            }
        }

        $this->command->info('Created 20 orders with order items.');
    }
}
