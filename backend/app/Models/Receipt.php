<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_number',
        'transaction_date',
        'items',
        'subtotal',
        'tax',
        'total',
        'payment_method',
        'customer_name',
        'status',
        'created_by',
        'voided_at',
        'void_reason',
        'post_void_approval_id',
    ];

    protected $casts = [
        'items' => 'array',
        'transaction_date' => 'datetime',
        'voided_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the post-void approval associated with this receipt
     */
    public function postVoidApproval()
    {
        return $this->belongsTo(PostVoidApproval::class);
    }

    /**
     * Check if receipt can be voided
     */
    public function canBeVoided(): bool
    {
        return $this->status === 'completed' && is_null($this->voided_at);
    }

    /**
     * Check if receipt is voided
     */
    public function isVoided(): bool
    {
        return !is_null($this->voided_at);
    }

    /**
     * Scope to get non-voided receipts
     */
    public function scopeActive($query)
    {
        return $query->whereNull('voided_at');
    }

    /**
     * Scope to get voided receipts
     */
    public function scopeVoided($query)
    {
        return $query->whereNotNull('voided_at');
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }
}
