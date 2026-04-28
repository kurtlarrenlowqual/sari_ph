<?php

use App\Models\Product;
use Database\Seeders\ProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it supports product crud operations', function (): void {
    $createResponse = $this->postJson('/api/products', [
        'name' => 'Marker',
        'barcode' => '480000000010',
        'price' => 25.50,
        'stock' => 40,
    ]);

    $createResponse
        ->assertCreated()
        ->assertJsonPath('data.name', 'Marker')
        ->assertJsonPath('data.barcode', '480000000010')
        ->assertJsonPath('data.stock', 40)
        ->assertJsonPath('data.status', 'Active');

    $productId = $createResponse->json('data.id');

    $this->getJson('/api/products')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->getJson("/api/products/{$productId}")
        ->assertOk()
        ->assertJsonPath('data.id', $productId);

    $this->putJson("/api/products/{$productId}", [
        'name' => 'Permanent Marker',
        'barcode' => '480000000010',
        'price' => 30.00,
        'stock' => 35,
        'status' => 'Inactive',
    ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Permanent Marker')
        ->assertJsonPath('data.stock', 35)
        ->assertJsonPath('data.status', 'Inactive');

    $this->deleteJson("/api/products/{$productId}")
        ->assertOk()
        ->assertJsonPath('message', 'Product deleted successfully.');

    $this->assertDatabaseMissing('products', [
        'id' => $productId,
    ]);
});

test('it searches products by name barcode and stock filters', function (): void {
    $this->seed(ProductSeeder::class);

    Product::query()->create([
        'name' => 'Correction Tape',
        'barcode' => '480000000099',
        'price' => 35.00,
        'stock' => 0,
        'status' => 'Inactive',
    ]);

    $this->getJson('/api/products/search?search=water')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Bottled Water 500ml');

    $this->getJson('/api/products/search?search=48000000000&status=Active&in_stock=1')
        ->assertOk()
        ->assertJsonCount(3, 'data');

    $this->getJson('/api/products/search?in_stock=0')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Correction Tape');

    $this->getJson('/api/products/search?min_stock=100')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('it validates product input', function (): void {
    Product::query()->create([
        'name' => 'Notebook',
        'barcode' => '480000000001',
        'price' => 50.00,
        'stock' => 120,
        'status' => 'Active',
    ]);

    $this->postJson('/api/products', [
        'name' => '',
        'barcode' => '480000000001',
        'price' => 0,
        'stock' => -1,
        'status' => 'Archived',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'name',
            'barcode',
            'price',
            'stock',
            'status',
        ]);
});
