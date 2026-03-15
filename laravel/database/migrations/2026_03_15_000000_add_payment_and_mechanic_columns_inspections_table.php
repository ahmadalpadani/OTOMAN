<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            // Payment columns (only if not exists)
            if (!Schema::hasColumn('inspections', 'payment_method')) {
                $table->string('payment_method', 50)->default('bank_transfer')->after('price');
            }
            if (!Schema::hasColumn('inspections', 'payment_proof_path')) {
                $table->string('payment_proof_path', 255)->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('inspections', 'payment_status')) {
                $table->string('payment_status', 20)->default('pending')->after('payment_proof_path');
            }

            // Mechanic/Technician assignment
            if (!Schema::hasColumn('inspections', 'mechanic_id')) {
                $table->unsignedBigInteger('mechanic_id')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('inspections', 'scheduled_date')) {
                $table->date('scheduled_date')->nullable()->after('mechanic_id');
            }
            if (!Schema::hasColumn('inspections', 'scheduled_time')) {
                $table->time('scheduled_time')->nullable()->after('scheduled_date');
            }
            if (!Schema::hasColumn('inspections', 'mechanic_notes')) {
                $table->text('mechanic_notes')->nullable()->after('scheduled_time');
            }
        });

        // Update status enum to include paid and scheduled (already has license_plate from previous migration)
        try {
            Schema::table('inspections', function (Blueprint $table) {
                $table->enum('status', ['pending', 'paid', 'scheduled', 'in_progress', 'completed', 'rejected'])->default('pending')->change();
            });
        } catch (\Exception $e) {
            // Status may already be updated or have issues, continue anyway
        }
    }

    public function down(): void
    {
        // Only drop if columns exist
        Schema::table('inspections', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('inspections', 'mechanic_notes')) $columnsToDrop[] = 'mechanic_notes';
            if (Schema::hasColumn('inspections', 'scheduled_time')) $columnsToDrop[] = 'scheduled_time';
            if (Schema::hasColumn('inspections', 'scheduled_date')) $columnsToDrop[] = 'scheduled_date';
            if (Schema::hasColumn('inspections', 'mechanic_id')) $columnsToDrop[] = 'mechanic_id';
            if (Schema::hasColumn('inspections', 'payment_status')) $columnsToDrop[] = 'payment_status';
            if (Schema::hasColumn('inspections', 'payment_proof_path')) $columnsToDrop[] = 'payment_proof_path';
            if (Schema::hasColumn('inspections', 'payment_method')) $columnsToDrop[] = 'payment_method';

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};