<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SaleController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PostVoidController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/auth/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/auth/change-password', [AuthController::class, 'changePassword']);

// User routes
Route::apiResource('users', UserController::class)->only(['index', 'store', 'update']);
Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

// Sales routes
Route::get('/sales', [SaleController::class, 'index']);
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/sales/{sale}', [SaleController::class, 'show']);

// Product routes
Route::get('/products/search', [ProductController::class, 'search']);
Route::apiResource('products', ProductController::class);

// Sanctum compatibility route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Receipts routes
Route::prefix('receipts')->group(function () {
    Route::get('/', [ReceiptController::class, 'index']);
    Route::post('/', [ReceiptController::class, 'store']);

    Route::get('/{receipt}', [ReceiptController::class, 'show']);
    Route::put('/{receipt}', [ReceiptController::class, 'update']);
    Route::delete('/{receipt}', [ReceiptController::class, 'destroy']);

    Route::get('/{receipt}/reprint', [ReceiptController::class, 'reprint']);
    Route::post('/{receipt}/void', [ReceiptController::class, 'void']);
});

// Reports routes
Route::prefix('reports')->group(function () {
    Route::get('/sales-summary', [ReportController::class, 'salesSummary']);
    Route::get('/daily-sales', [ReportController::class, 'dailySalesReport']);
    Route::get('/void-report', [ReportController::class, 'voidReport']);
    Route::get('/payment-methods', [ReportController::class, 'paymentMethodAnalysis']);
    Route::get('/customer-sales', [ReportController::class, 'customerSalesReport']);
    Route::get('/transactions', [ReportController::class, 'transactionReport']);
});

// Post-void approval routes
Route::prefix('post-void-approvals')->group(function () {
    Route::get('/', [PostVoidController::class, 'index']);
    Route::post('/', [PostVoidController::class, 'store']);

    Route::get('/{approval}', [PostVoidController::class, 'show']);

    Route::post('/{approval}/approve', [PostVoidController::class, 'approve']);
    Route::post('/{approval}/reject', [PostVoidController::class, 'reject']);

    Route::get('/statistics/overview', [PostVoidController::class, 'statistics']);
});
