<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('order_code')->unique(); // INS-XXXXXX
            $table->string('vehicle_type');         // mobil / motor (di UI kamu mobil dulu)
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('mileage');

            $table->string('condition');            // excellent/good/fair/poor
            $table->text('notes')->nullable();

            $table->date('inspection_date');
            $table->string('inspection_time');      // "08:00-10:00"

            $table->string('province');
            $table->string('city');
            $table->text('address');
            $table->string('contact_phone');

            $table->unsignedInteger('price')->default(350000);

            $table->string('status')->default('pending'); 
            // pending / confirmed / completed / cancelled

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};