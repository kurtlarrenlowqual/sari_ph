<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        $sales = Sale::query()
            ->with('items')
            ->latest('sold_at')
            ->latest()
            ->paginate(20);

        return response()->json($sales);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer'],
            'items.*.sku' => ['nullable', 'string', 'max:64'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_total' => ['nullable', 'numeric', 'min:0'],
            'discount_total' => ['nullable', 'numeric', 'min:0'],
            'tax_total' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'in:cash,card,gcash,maya,other'],
            'amount_tendered' => ['required', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
        ]);

        $subtotal = 0.0;
        $itemDiscountTotal = 0.0;

        foreach ($validated['items'] as $item) {
            $subtotal += (float) $item['unit_price'] * (int) $item['quantity'];
            $itemDiscountTotal += (float) ($item['discount_total'] ?? 0);
        }

        $orderDiscountTotal = (float) ($validated['discount_total'] ?? 0);
        $taxTotal = (float) ($validated['tax_total'] ?? 0);
        $discountTotal = $itemDiscountTotal + $orderDiscountTotal;
        $total = round(max(0, $subtotal - $discountTotal + $taxTotal), 2);
        $amountTendered = round((float) $validated['amount_tendered'], 2);

        if ($amountTendered < $total) {
            throw ValidationException::withMessages([
                'amount_tendered' => ['The amount tendered must be greater than or equal to the sale total.'],
            ]);
        }

        $sale = DB::transaction(function () use ($validated, $subtotal, $discountTotal, $taxTotal, $total, $amountTendered) {
            $sale = Sale::create([
                'receipt_number' => $this->generateReceiptNumber(),
                'cashier_id' => auth()->id(),
                'subtotal' => round($subtotal, 2),
                'discount_total' => round($discountTotal, 2),
                'tax_total' => round($taxTotal, 2),
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'amount_tendered' => $amountTendered,
                'change_due' => round($amountTendered - $total, 2),
                'status' => 'paid',
                'sold_at' => $validated['sold_at'] ?? now(),
            ]);

            foreach ($validated['items'] as $item) {
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $itemDiscount = (float) ($item['discount_total'] ?? 0);

                $sale->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'sku' => $item['sku'] ?? null,
                    'name' => $item['name'],
                    'quantity' => $quantity,
                    'unit_price' => round($unitPrice, 2),
                    'discount_total' => round($itemDiscount, 2),
                    'line_total' => round(max(0, ($unitPrice * $quantity) - $itemDiscount), 2),
                ]);
            }

            return $sale->load('items');
        });

        return response()->json(['data' => $sale], 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        return response()->json(['data' => $sale->load('items')]);
    }

    private function generateReceiptNumber(): string
    {
        do {
            $receiptNumber = 'SALE-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Sale::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }
}
