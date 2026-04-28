<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PostVoidApproval>
 */
class PostVoidApprovalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'receipt_id' => 1,
            'requested_by' => $this->faker->numberBetween(1, 10),
            'approved_by' => null,
            'reason' => $this->faker->sentence(),
            'status' => 'pending',
            'notes' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
        ];
    }

    /**
     * Indicate that the approval is approved.
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'approved_by' => $this->faker->numberBetween(1, 10),
                'status' => 'approved',
                'approved_at' => $this->faker->dateTime(),
                'notes' => 'Approved',
            ];
        });
    }

    /**
     * Indicate that the approval is rejected.
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'approved_by' => $this->faker->numberBetween(1, 10),
                'status' => 'rejected',
                'rejected_at' => $this->faker->dateTime(),
                'rejection_reason' => $this->faker->sentence(),
            ];
        });
    }
}
