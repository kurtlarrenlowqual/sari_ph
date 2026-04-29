<?php

namespace Tests\Feature;

use App\Models\Receipt;
use App\Models\PostVoidApproval;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptReportApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test getting all receipts
     */
    public function test_can_get_all_receipts(): void
    {
        Receipt::factory()->count(5)->create();

        $response = $this->getJson('/api/receipts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'receipt_number',
                        'transaction_date',
                        'total',
                        'tax',
                        'payment_method'
                    ]
                ]
            ]);
    }

    /**
     * Test filtering receipts by status
     */
    public function test_can_filter_receipts_by_status(): void
    {
        Receipt::factory()->create(['status' => 'completed']);
        Receipt::factory()->create(['status' => 'pending']);

        $response = $this->getJson('/api/receipts?status=completed');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.status', 'completed');
    }

    /**
     * Test searching receipts by receipt number
     */
    public function test_can_search_receipts_by_number(): void
    {
        Receipt::factory()->create(['receipt_number' => 'RCP-001']);
        Receipt::factory()->create(['receipt_number' => 'RCP-002']);

        $response = $this->getJson('/api/receipts?search=RCP-001');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /**
     * Test creating a receipt
     */
    public function test_can_create_receipt(): void
    {
        $data = [
            'receipt_number' => 'RCP-TEST-001',
            'transaction_date' => now()->format('Y-m-d H:i:s'),
            'items' => [
                ['product' => 'item1', 'price' => 100],
                ['product' => 'item2', 'price' => 50]
            ],
            'subtotal' => 150,
            'tax' => 15,
            'total' => 165,
            'payment_method' => 'cash',
            'created_by' => 1
        ];

        $response = $this->postJson('/api/receipts', $data);

        $response->assertStatus(201)
            ->assertJsonPath('receipt_number', 'RCP-TEST-001')
            ->assertJsonPath('total', 165);

        $this->assertDatabaseHas('receipts', ['receipt_number' => 'RCP-TEST-001']);
    }

    /**
     * Test getting a single receipt
     */
    public function test_can_get_single_receipt(): void
    {
        $receipt = Receipt::factory()->create();

        $response = $this->getJson("/api/receipts/{$receipt->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $receipt->id)
            ->assertJsonPath('receipt_number', $receipt->receipt_number);
    }

    /**
     * Test updating a receipt
     */
    public function test_can_update_receipt(): void
    {
        $receipt = Receipt::factory()->create(['customer_name' => 'John Doe']);

        $response = $this->putJson("/api/receipts/{$receipt->id}", [
            'customer_name' => 'Jane Doe'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('customer_name', 'Jane Doe');

        $this->assertDatabaseHas('receipts', ['id' => $receipt->id, 'customer_name' => 'Jane Doe']);
    }

    /**
     * Test cannot update voided receipt
     */
    public function test_cannot_update_voided_receipt(): void
    {
        $receipt = Receipt::factory()->create(['voided_at' => now()]);

        $response = $this->putJson("/api/receipts/{$receipt->id}", [
            'customer_name' => 'Jane Doe'
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Cannot update a voided receipt');
    }

    /**
     * Test reprinting a receipt
     */
    public function test_can_reprint_receipt(): void
    {
        $receipt = Receipt::factory()->create();

        $response = $this->getJson("/api/receipts/{$receipt->id}/reprint");

        $response->assertStatus(200)
            ->assertJsonPath('is_reprint', true)
            ->assertJsonStructure([
                'receipt' => ['id', 'receipt_number', 'total'],
                'reprint_timestamp'
            ]);
    }

    /**
     * Test voiding a receipt
     */
    public function test_can_void_receipt(): void
    {
        $receipt = Receipt::factory()->create(['voided_at' => null]);

        $response = $this->postJson("/api/receipts/{$receipt->id}/void", [
            'reason' => 'Customer requested void'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Receipt voided successfully');

        $this->assertDatabaseHas('receipts', [
            'id' => $receipt->id,
            'status' => 'cancelled'
        ]);
    }

    /**
     * Test cannot void already voided receipt
     */
    public function test_cannot_void_already_voided_receipt(): void
    {
        $receipt = Receipt::factory()->create(['voided_at' => now()]);

        $response = $this->postJson("/api/receipts/{$receipt->id}/void", [
            'reason' => 'Customer requested void'
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Receipt cannot be voided');
    }

    /**
     * Test deleting a receipt
     */
    public function test_can_delete_receipt(): void
    {
        $receipt = Receipt::factory()->create(['voided_at' => null]);

        $response = $this->deleteJson("/api/receipts/{$receipt->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('receipts', ['id' => $receipt->id]);
    }

    /**
     * Test cannot delete voided receipt
     */
    public function test_cannot_delete_voided_receipt(): void
    {
        $receipt = Receipt::factory()->create(['voided_at' => now()]);

        $response = $this->deleteJson("/api/receipts/{$receipt->id}");

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Cannot delete a voided receipt');
    }

    // Report Tests

    /**
     * Test sales summary report
     */
    public function test_can_get_sales_summary_report(): void
    {
        Receipt::factory()->create(['total' => 100, 'tax' => 10]);
        Receipt::factory()->create(['total' => 200, 'tax' => 20]);

        $response = $this->getJson('/api/reports/sales-summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_sales',
                'total_tax',
                'receipt_count',
                'by_payment_method'
            ])
            ->assertJsonPath('receipt_count', 2);
    }

    /**
     * Test daily sales report
     */
    public function test_can_get_daily_sales_report(): void
    {
        Receipt::factory()->count(3)->create();

        $response = $this->getJson('/api/reports/daily-sales');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'date',
                    'transaction_count',
                    'total_sales',
                    'total_tax'
                ]
            ]);
    }

    /**
     * Test void report
     */
    public function test_can_get_void_report(): void
    {
        Receipt::factory()->create([
            'voided_at' => now(),
            'total' => 100,
            'void_reason' => 'Customer request'
        ]);

        $response = $this->getJson('/api/reports/void-report');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_voided_amount',
                'void_count',
                'by_date_and_reason'
            ])
            ->assertJsonPath('void_count', 1);
    }

    /**
     * Test payment method analysis
     */
    public function test_can_get_payment_method_analysis(): void
    {
        Receipt::factory()->create(['payment_method' => 'cash']);
        Receipt::factory()->create(['payment_method' => 'card']);

        $response = $this->getJson('/api/reports/payment-methods');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    /**
     * Test customer sales report
     */
    public function test_can_get_customer_sales_report(): void
    {
        Receipt::factory()->create(['customer_name' => 'John']);
        Receipt::factory()->create(['customer_name' => 'Jane']);

        $response = $this->getJson('/api/reports/customer-sales');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'customer_name',
                    'transaction_count',
                    'total_sales'
                ]
            ]);
    }

    /**
     * Test transaction report
     */
    public function test_can_get_transaction_report(): void
    {
        Receipt::factory()->count(5)->create();

        $response = $this->getJson('/api/reports/transactions');

        $response->assertStatus(200)
            ->assertJsonCount(5)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'receipt_number',
                    'transaction_date',
                    'customer_name',
                    'payment_method',
                    'total',
                    'tax'
                ]
            ]);
    }

    // Post-Void Approval Tests

    /**
     * Test getting all post-void approvals
     */
    public function test_can_get_all_post_void_approvals(): void
    {
        $receipt = Receipt::factory()->create();
        PostVoidApproval::factory()->create(['receipt_id' => $receipt->id]);

        $response = $this->getJson('/api/post-void-approvals');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'receipt_id',
                        'status',
                        'reason'
                    ]
                ]
            ]);
    }

    /**
     * Test filtering post-void approvals by status
     */
    public function test_can_filter_post_void_approvals_by_status(): void
    {
        $receipt = Receipt::factory()->create();
        PostVoidApproval::factory()->create(['receipt_id' => $receipt->id, 'status' => 'pending']);
        PostVoidApproval::factory()->create(['receipt_id' => $receipt->id, 'status' => 'approved']);

        $response = $this->getJson('/api/post-void-approvals?status=pending');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.status', 'pending');
    }

    /**
     * Test creating a post-void approval request
     */
    public function test_can_create_post_void_approval(): void
    {
        $receipt = Receipt::factory()->create();

        $response = $this->postJson('/api/post-void-approvals', [
            'receipt_id' => $receipt->id,
            'requested_by' => 1,
            'reason' => 'Customer requested to void the receipt'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('receipt_id', $receipt->id);

        $this->assertDatabaseHas('post_void_approvals', ['receipt_id' => $receipt->id]);
    }

    /**
     * Test getting a specific post-void approval
     */
    public function test_can_get_single_post_void_approval(): void
    {
        $receipt = Receipt::factory()->create();
        $approval = PostVoidApproval::factory()->create(['receipt_id' => $receipt->id]);

        $response = $this->getJson("/api/post-void-approvals/{$approval->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $approval->id)
            ->assertJsonPath('receipt_id', $receipt->id);
    }

    /**
     * Test approving a post-void request
     */
    public function test_can_approve_post_void_request(): void
    {
        $receipt = Receipt::factory()->create();
        $approval = PostVoidApproval::factory()->create(['receipt_id' => $receipt->id, 'status' => 'pending']);

        $response = $this->postJson("/api/post-void-approvals/{$approval->id}/approve", [
            'approved_by' => 1,
            'notes' => 'Approved by supervisor'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Post-void request approved and receipt voided');

        $this->assertDatabaseHas('post_void_approvals', [
            'id' => $approval->id,
            'status' => 'approved'
        ]);

        $this->assertDatabaseHas('receipts', [
            'id' => $receipt->id,
            'status' => 'cancelled'
        ]);
    }

    /**
     * Test rejecting a post-void request
     */
    public function test_can_reject_post_void_request(): void
    {
        $receipt = Receipt::factory()->create();
        $approval = PostVoidApproval::factory()->create(['receipt_id' => $receipt->id, 'status' => 'pending']);

        $response = $this->postJson("/api/post-void-approvals/{$approval->id}/reject", [
            'rejection_reason' => 'Insufficient reason provided',
            'rejected_by' => 1
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Post-void request rejected');

        $this->assertDatabaseHas('post_void_approvals', [
            'id' => $approval->id,
            'status' => 'rejected'
        ]);
    }

    /**
     * Test cannot approve already approved request
     */
    public function test_cannot_approve_already_approved_request(): void
    {
        $receipt = Receipt::factory()->create();
        $approval = PostVoidApproval::factory()->create(['receipt_id' => $receipt->id, 'status' => 'approved']);

        $response = $this->postJson("/api/post-void-approvals/{$approval->id}/approve", [
            'approved_by' => 1
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'Only pending requests can be approved');
    }

    /**
     * Test post-void statistics
     */
    public function test_can_get_post_void_statistics(): void
    {
        $receipt1 = Receipt::factory()->create();
        $receipt2 = Receipt::factory()->create();

        PostVoidApproval::factory()->create(['receipt_id' => $receipt1->id, 'status' => 'pending']);
        PostVoidApproval::factory()->create(['receipt_id' => $receipt2->id, 'status' => 'approved']);

        $response = $this->getJson('/api/post-void-approvals/statistics/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'pending_count',
                'approved_count',
                'rejected_count',
                'total_approved_amount'
            ]);
    }
}
