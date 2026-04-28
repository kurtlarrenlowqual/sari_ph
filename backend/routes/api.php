<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('products')->group(function (): void {
    Route::get('search', [ProductController::class, 'search']);
});

Route::apiResource('products', ProductController::class);
