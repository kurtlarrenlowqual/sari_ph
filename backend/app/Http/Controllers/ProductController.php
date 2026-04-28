<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = $this->filteredProducts($request)->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->productRules());
        $validated['status'] = $validated['status'] ?? 'Active';

        $product = Product::query()->create($validated);

        return response()->json([
            'data' => $product,
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $product,
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate($this->productRules($product));

        $product->update($validated);

        return response()->json([
            'data' => $product->fresh(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    private function filteredProducts(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['Active', 'Inactive'])],
            'in_stock' => ['nullable', 'boolean'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'max_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $query = Product::query()->orderBy('name');

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('barcode', 'like', '%'.$search.'%');
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->has('in_stock')) {
            $request->boolean('in_stock')
                ? $query->where('stock', '>', 0)
                : $query->where('stock', 0);
        }

        if ($request->filled('min_stock')) {
            $query->where('stock', '>=', (int) $request->input('min_stock'));
        }

        if ($request->filled('max_stock')) {
            $query->where('stock', '<=', (int) $request->input('max_stock'));
        }

        return $query;
    }

    private function productRules(?Product $product = null): array
    {
        $uniqueBarcode = Rule::unique('products', 'barcode');

        if ($product !== null) {
            $uniqueBarcode->ignore($product->id);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['required', 'string', 'max:100', $uniqueBarcode],
            'price' => ['required', 'numeric', 'min:0.01'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['sometimes', 'string', Rule::in(['Active', 'Inactive'])],
        ];
    }
}
