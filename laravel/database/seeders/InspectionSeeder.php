<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inspection;
use App\Models\User;
use App\Models\Mechanic;

class InspectionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('role', 'user')->first();
        $mechanic = Mechanic::first();

        // PENDING
        Inspection::create([
            'user_id' => $user->id,
            'order_code' => 'INS-ABC123',
            'vehicle_type' => 'mobil',
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2021,
            'mileage' => 45000,
            'condition' => 'good',
            'notes' => 'Mobil terawat',
            'license_plate' => 'B 1234 ABC',
            'inspection_date' => now(),
            'inspection_time' => '09:00-11:00',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Sudirman No. 123',
            'contact_phone' => '081234567890',
            'price' => 350000,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'paid',
            'status' => 'pending',
        ]);

        // IN PROGRESS
        Inspection::create([
            'user_id' => $user->id,
            'order_code' => 'INS-DEF456',
            'vehicle_type' => 'mobil',
            'brand' => 'Honda',
            'model' => 'Civic',
            'year' => 2020,
            'mileage' => 35000,
            'condition' => 'good',
            'notes' => 'Cek sebelum beli',
            'license_plate' => 'D 5678 DEF',
            'inspection_date' => now(),
            'inspection_time' => '09:00-11:00',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'address' => 'Jl. Braga No. 45',
            'contact_phone' => '081234567890',
            'price' => 350000,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'paid',
            'status' => 'in_progress',
            'mechanic_id' => $mechanic->id,
            'scheduled_date' => now(),
            'scheduled_time' => now(),
        ]);

        // COMPLETED
        Inspection::create([
            'user_id' => $user->id,
            'order_code' => 'INS-GHI789',
            'vehicle_type' => 'mobil',
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2021,
            'mileage' => 50000,
            'condition' => 'good',
            'notes' => 'Mobil dalam kondisi baik',
            'license_plate' => 'F 9999 XYZ',
            'inspection_date' => now(),
            'inspection_time' => '09:00-11:00',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'address' => 'Jl. Asia Afrika',
            'contact_phone' => '081234567890',
            'price' => 350000,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'paid',
            'status' => 'completed',
            'mechanic_id' => $mechanic->id,
            'scheduled_date' => now(),
            'scheduled_time' => now(),
            'admin_notes' => 'Inspeksi selesai',
        ]);
    }
}