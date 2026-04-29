<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_void_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receipt_id');
            $table->unsignedBigInteger('requested_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('rejected_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('receipt_id')
                ->references('id')
                ->on('receipts')
                ->onDelete('cascade');
        });

        Schema::table('receipts', function (Blueprint $table) {
            $table->foreign('post_void_approval_id')
                ->references('id')
                ->on('post_void_approvals')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropForeign(['post_void_approval_id']);
        });

        Schema::dropIfExists('post_void_approvals');
    }
};
