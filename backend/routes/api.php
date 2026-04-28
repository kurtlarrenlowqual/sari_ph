<?php

use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('/sales', [SaleController::class, 'index']);
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/sales/{sale}', [SaleController::class, 'show']);
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PostVoidController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Receipts routes
Route::prefix('receipts')->group(function () {
    // List and create receipts
    Route::get('/', [ReceiptController::class, 'index']);
    Route::post('/', [ReceiptController::class, 'store']);

    // Individual receipt operations
    Route::get('/{receipt}', [ReceiptController::class, 'show']);
    Route::put('/{receipt}', [ReceiptController::class, 'update']);
    Route::delete('/{receipt}', [ReceiptController::class, 'destroy']);

    // Reprint receipt
    Route::get('/{receipt}/reprint', [ReceiptController::class, 'reprint']);

    // Void receipt
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
    // List and create post-void requests
    Route::get('/', [PostVoidController::class, 'index']);
    Route::post('/', [PostVoidController::class, 'store']);

    // Individual approval operations
    Route::get('/{approval}', [PostVoidController::class, 'show']);

    // Approve or reject post-void request
    Route::post('/{approval}/approve', [PostVoidController::class, 'approve']);
    Route::post('/{approval}/reject', [PostVoidController::class, 'reject']);

    // Statistics
    Route::get('/statistics/overview', [PostVoidController::class, 'statistics']);
});
