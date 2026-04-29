<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Get sales summary report
     *
     * @return JsonResponse
     */
    public function salesSummary(): JsonResponse
    {
        $totalSales = Receipt::active()->sum('total');
        $totalTax = Receipt::active()->sum('tax');
        $receiptCount = Receipt::active()->count();

        $byPaymentMethod = Receipt::active()
            ->groupBy('payment_method')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as total')
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'total_tax' => $totalTax,
            'receipt_count' => $receiptCount,
            'by_payment_method' => $byPaymentMethod
        ]);
    }

    /**
     * Get daily sales report
     *
     * @return JsonResponse
     */
    public function dailySalesReport(): JsonResponse
    {
        $report = Receipt::active()
            ->selectRaw('DATE(transaction_date) as date, COUNT(*) as transaction_count, SUM(total) as total_sales, SUM(tax) as total_tax')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($report);
    }

    /**
     * Get void report
     *
     * @return JsonResponse
     */
    public function voidReport(): JsonResponse
    {
        $voidedReceipts = Receipt::voided()
            ->selectRaw('DATE(voided_at) as date, COUNT(*) as count, SUM(total) as total_voided, void_reason')
            ->groupBy('date', 'void_reason')
            ->orderBy('date', 'desc')
            ->get();

        $totalVoided = Receipt::voided()->sum('total');
        $voidCount = Receipt::voided()->count();

        return response()->json([
            'total_voided_amount' => $totalVoided,
            'void_count' => $voidCount,
            'by_date_and_reason' => $voidedReceipts
        ]);
    }

    /**
     * Get payment method analysis
     *
     * @return JsonResponse
     */
    public function paymentMethodAnalysis(): JsonResponse
    {
        $analysis = Receipt::active()
            ->groupBy('payment_method')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as total, AVG(total) as average')
            ->get();

        return response()->json($analysis);
    }

    /**
     * Get customer sales report
     *
     * @return JsonResponse
     */
    public function customerSalesReport(): JsonResponse
    {
        $report = Receipt::active()
            ->whereNotNull('customer_name')
            ->groupBy('customer_name')
            ->selectRaw('customer_name, COUNT(*) as transaction_count, SUM(total) as total_sales')
            ->orderBy('total_sales', 'desc')
            ->get();

        return response()->json($report);
    }

    /**
     * Get detailed transaction report
     *
     * @return JsonResponse
     */
    public function transactionReport(): JsonResponse
    {
        $transactions = Receipt::active()
            ->select('id', 'receipt_number', 'transaction_date', 'customer_name', 'payment_method', 'total', 'tax')
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json($transactions);
    }
}
