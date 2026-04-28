<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Receipt>
 */
class ReceiptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 1000);
        $tax = round($subtotal * 0.10, 2);
        $total = round($subtotal + $tax, 2);

        return [
            'receipt_number' => 'RCP-' . $this->faker->unique()->numerify('########'),
            'transaction_date' => $this->faker->dateTime(),
            'items' => [
                [
                    'product' => $this->faker->word(),
                    'quantity' => $this->faker->numberBetween(1, 10),
                    'price' => $this->faker->randomFloat(2, 10, 100)
                ]
            ],
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'payment_method' => $this->faker->randomElement(['cash', 'card', 'check']),
            'customer_name' => $this->faker->optional()->name(),
            'status' => 'completed',
            'created_by' => 1,
            'voided_at' => null,
            'void_reason' => null,
            'post_void_approval_id' => null,
        ];
    }

    /**
     * Indicate that the receipt is voided.
     */
    public function voided(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'voided_at' => $this->faker->dateTime(),
                'void_reason' => 'Voided by system',
                'status' => 'cancelled',
            ];
        });
    }
}
