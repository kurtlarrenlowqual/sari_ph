<?php

use App\Models\Sale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function () {
    Route::prefix('api')->group(base_path('routes/api.php'));
});

test('it creates a paid sale for pos checkout', function () {
    $response = $this->postJson('/api/sales', [
        'payment_method' => 'cash',
        'amount_tendered' => 500,
        'items' => [
            [
                'product_id' => 1,
                'sku' => 'COFFEE-001',
                'name' => 'Iced Coffee',
                'quantity' => 2,
                'unit_price' => 120,
                'discount_total' => 10,
            ],
            [
                'sku' => 'PASTRY-001',
                'name' => 'Croissant',
                'quantity' => 1,
                'unit_price' => 95,
            ],
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.status', 'paid')
        ->assertJsonPath('data.subtotal', '335.00')
        ->assertJsonPath('data.discount_total', '10.00')
        ->assertJsonPath('data.total', '325.00')
        ->assertJsonPath('data.change_due', '175.00')
        ->assertJsonCount(2, 'data.items');

    $this->assertDatabaseHas('sales', [
        'payment_method' => 'cash',
        'status' => 'paid',
        'total' => 325,
    ]);

    $this->assertDatabaseHas('sale_items', [
        'name' => 'Iced Coffee',
        'quantity' => 2,
        'line_total' => 230,
    ]);
});

test('it rejects checkout when amount tendered is not enough', function () {
    $response = $this->postJson('/api/sales', [
        'payment_method' => 'cash',
        'amount_tendered' => 100,
        'items' => [
            [
                'name' => 'Iced Coffee',
                'quantity' => 2,
                'unit_price' => 120,
            ],
        ],
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors('amount_tendered');

    expect(Sale::count())->toBe(0);
});

test('it shows a sale with its line items', function () {
    $this->postJson('/api/sales', [
        'payment_method' => 'gcash',
        'amount_tendered' => 250,
        'items' => [
            [
                'name' => 'Milk Tea',
                'quantity' => 1,
                'unit_price' => 150,
            ],
        ],
    ])->assertCreated();

    $sale = Sale::firstOrFail();

    $this->getJson("/api/sales/{$sale->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $sale->id)
        ->assertJsonCount(1, 'data.items');
});
