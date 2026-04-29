<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('id');
            }

            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('Cashier')->after('password');
            }

            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('Active')->after('role');
            }

            if (!Schema::hasColumn('users', 'is_temp_password')) {
                $table->boolean('is_temp_password')->default(false)->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique(['username']);
                $table->dropColumn('username');
            }

            if (Schema::hasColumn('users', 'is_temp_password')) {
                $table->dropColumn('is_temp_password');
            }

            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }

            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
        });
    }
};
