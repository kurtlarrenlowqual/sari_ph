<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Notebook',
                'barcode' => '480000000001',
                'price' => 50.00,
                'stock' => 120,
                'status' => 'Active',
            ],
            [
                'name' => 'Ballpen',
                'barcode' => '480000000002',
                'price' => 10.00,
                'stock' => 300,
                'status' => 'Active',
            ],
            [
                'name' => 'Bottled Water 500ml',
                'barcode' => '480000000003',
                'price' => 20.00,
                'stock' => 80,
                'status' => 'Active',
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['barcode' => $product['barcode']],
                $product
            );
        }
    }
}
