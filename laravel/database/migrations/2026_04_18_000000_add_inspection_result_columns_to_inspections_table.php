<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->enum('result', ['approve', 'pending', 'reject'])->nullable()->after('status');
            $table->string('body_condition', 50)->nullable()->after('result');
            $table->string('engine_condition', 50)->nullable()->after('body_condition');
            $table->string('interior_condition', 50)->nullable()->after('engine_condition');
            $table->text('result_notes')->nullable()->after('interior_condition');
            $table->timestamp('completed_at')->nullable()->after('result_notes');
        });
    }

    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropColumn([
                'result',
                'body_condition',
                'engine_condition',
                'interior_condition',
                'result_notes',
                'completed_at',
            ]);
        });
    }
};
