<?php

namespace App\Http\Controllers;

use App\Models\PostVoidApproval;
use App\Models\Receipt;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PostVoidController extends Controller
{
    /**
     * Get all post-void approval requests
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = PostVoidApproval::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter only pending
        if ($request->boolean('pending_only', false)) {
            $query->pending();
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $approvals = $query->with('receipt')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($approvals);
    }

    /**
     * Get a specific post-void approval request
     *
     * @param PostVoidApproval $approval
     * @return JsonResponse
     */
    public function show(PostVoidApproval $approval): JsonResponse
    {
        return response()->json($approval->load('receipt'));
    }

    /**
     * Create a post-void approval request
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receipt_id' => 'nullable|exists:receipts,id',
            'receipt_number' => 'nullable|string|exists:receipts,receipt_number',
            'requested_by' => 'required|integer',
            'reason' => 'required|string|min:10',
        ]);

        $receipt = isset($validated['receipt_id'])
            ? Receipt::find($validated['receipt_id'])
            : Receipt::where('receipt_number', $validated['receipt_number'] ?? '')->first();

        if (!$receipt) {
            return response()->json([
                'error' => 'Receipt not found'
            ], 422);
        }

        // Check if receipt can be voided
        if (!$receipt->canBeVoided()) {
            return response()->json([
                'error' => 'Receipt cannot be voided'
            ], 422);
        }

        // Create approval request
        $approval = PostVoidApproval::create([
            'receipt_id' => $receipt->id,
            'requested_by' => $validated['requested_by'],
            'reason' => $validated['reason'],
            'status' => 'pending'
        ]);

        return response()->json($approval, 201);
    }

    /**
     * Approve a post-void request
     *
     * @param Request $request
     * @param PostVoidApproval $approval
     * @return JsonResponse
     */
    public function approve(Request $request, PostVoidApproval $approval): JsonResponse
    {
        if ($approval->status !== 'pending') {
            return response()->json([
                'error' => 'Only pending requests can be approved'
            ], 422);
        }

        $validated = $request->validate([
            'approved_by' => 'required|integer',
            'notes' => 'nullable|string',
        ]);

        // Update approval status
        $approval->update([
            'status' => 'approved',
            'approved_by' => $validated['approved_by'],
            'approved_at' => now(),
            'notes' => $validated['notes']
        ]);

        // Void the associated receipt
        $receipt = $approval->receipt;
        $receipt->update([
            'voided_at' => now(),
            'void_reason' => $approval->reason,
            'status' => 'cancelled',
            'post_void_approval_id' => $approval->id
        ]);

        Sale::query()
            ->where('receipt_number', $receipt->receipt_number)
            ->update(['status' => 'voided']);

        return response()->json([
            'message' => 'Post-void request approved and receipt voided',
            'approval' => $approval->load('receipt')
        ]);
    }

    /**
     * Reject a post-void request
     *
     * @param Request $request
     * @param PostVoidApproval $approval
     * @return JsonResponse
     */
    public function reject(Request $request, PostVoidApproval $approval): JsonResponse
    {
        if ($approval->status !== 'pending') {
            return response()->json([
                'error' => 'Only pending requests can be rejected'
            ], 422);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
            'rejected_by' => 'required|integer',
        ]);

        // Update approval status
        $approval->update([
            'status' => 'rejected',
            'approved_by' => $validated['rejected_by'],
            'rejected_at' => now(),
            'rejection_reason' => $validated['rejection_reason']
        ]);

        return response()->json([
            'message' => 'Post-void request rejected',
            'approval' => $approval
        ]);
    }

    /**
     * Get statistics on post-void requests
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        $pendingCount = PostVoidApproval::pending()->count();
        $approvedCount = PostVoidApproval::approved()->count();
        $rejectedCount = PostVoidApproval::rejected()->count();

        $approvedAmount = Receipt::whereHas('postVoidApproval', function ($query) {
            $query->where('status', 'approved');
        })->sum('total');

        return response()->json([
            'pending_count' => $pendingCount,
            'approved_count' => $approvedCount,
            'rejected_count' => $rejectedCount,
            'total_approved_amount' => $approvedAmount
        ]);
    }
}
