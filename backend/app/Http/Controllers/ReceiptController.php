<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReceiptController extends Controller
{
    /**
     * Get all receipts with optional filtering
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Receipt::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by voided status
        if ($request->boolean('include_voided', false) === false) {
            $query->active();
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange(
                $request->input('start_date'),
                $request->input('end_date')
            );
        }

        // Search by receipt number or customer name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('receipt_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%");
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $receipts = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

        return response()->json($receipts);
    }

    /**
     * Get a single receipt by ID
     *
     * @param Receipt $receipt
     * @return JsonResponse
     */
    public function show(Receipt $receipt): JsonResponse
    {
        return response()->json($receipt->load('postVoidApproval'));
    }

    /**
     * Create a new receipt
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receipt_number' => 'required|string|unique:receipts',
            'transaction_date' => 'required|date_format:Y-m-d H:i:s',
            'items' => 'required|array|min:1',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'customer_name' => 'nullable|string',
            'created_by' => 'required|integer',
        ]);

        $receipt = Receipt::create($validated);

        return response()->json($receipt, 201);
    }

    /**
     * Update an existing receipt
     *
     * @param Request $request
     * @param Receipt $receipt
     * @return JsonResponse
     */
    public function update(Request $request, Receipt $receipt): JsonResponse
    {
        if ($receipt->isVoided()) {
            return response()->json([
                'error' => 'Cannot update a voided receipt'
            ], 422);
        }

        $validated = $request->validate([
            'items' => 'sometimes|array|min:1',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|string',
            'customer_name' => 'nullable|string',
        ]);

        $receipt->update($validated);

        return response()->json($receipt);
    }

    /**
     * Delete a receipt
     *
     * @param Receipt $receipt
     * @return JsonResponse
     */
    public function destroy(Receipt $receipt): JsonResponse
    {
        if ($receipt->isVoided()) {
            return response()->json([
                'error' => 'Cannot delete a voided receipt'
            ], 422);
        }

        $receipt->delete();

        return response()->json(null, 204);
    }

    /**
     * Reprint a receipt (get receipt details for reprinting)
     *
     * @param Receipt $receipt
     * @return JsonResponse
     */
    public function reprint(Receipt $receipt): JsonResponse
    {
        return response()->json([
            'receipt' => $receipt,
            'reprint_timestamp' => now(),
            'is_reprint' => true
        ]);
    }

    /**
     * Void a receipt (requires post-void approval if business rule applies)
     *
     * @param Request $request
     * @param Receipt $receipt
     * @return JsonResponse
     */
    public function void(Request $request, Receipt $receipt): JsonResponse
    {
        if (!$receipt->canBeVoided()) {
            return response()->json([
                'error' => 'Receipt cannot be voided'
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        // Mark receipt as voided
        $receipt->update([
            'voided_at' => now(),
            'void_reason' => $validated['reason'],
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Receipt voided successfully',
            'receipt' => $receipt
        ]);
    }
}
