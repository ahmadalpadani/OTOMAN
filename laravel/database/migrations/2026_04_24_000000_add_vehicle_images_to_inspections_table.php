<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            if (!Schema::hasColumn('inspections', 'vehicle_price')) {
                $table->unsignedInteger('vehicle_price')->nullable()->after('price');
            }
            $table->json('vehicle_images')->nullable()->after('vehicle_price');
        });
    }

    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropColumn('vehicle_images');
            if (Schema::hasColumn('inspections', 'vehicle_price')) {
                $table->dropColumn('vehicle_price');
            }
        });
    }
};
