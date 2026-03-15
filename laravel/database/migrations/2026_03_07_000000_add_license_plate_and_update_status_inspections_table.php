<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            // Tambah license_plate
            $table->string('license_plate')->nullable()->after('model');

            // Update status: pending, in_progress, completed, rejected
            $table->enum('status', ['pending', 'in_progress', 'completed', 'rejected'])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropColumn('license_plate');
            $table->string('status')->default('pending')->change();
        });
    }
};
