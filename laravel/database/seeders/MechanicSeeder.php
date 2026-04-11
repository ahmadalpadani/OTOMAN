<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mechanic;
use App\Models\User;

class MechanicSeeder extends Seeder
{
    public function run(): void
    {
        $inspectors = User::where('role', 'inspector')->get();

        foreach ($inspectors as $user) {
            Mechanic::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'specialization' => 'Mobil',
                'is_active' => true,
            ]);
        }
    }
}