<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ADMIN
        User::create([
            'name' => 'Admin OTOMAN',
            'email' => 'admin@otoman.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // INSPECTOR 1
        User::create([
            'name' => 'Budi Teknisi',
            'email' => 'budi@otoman.com',
            'phone' => '081987654321',
            'password' => Hash::make('password'),
            'role' => 'inspector',
        ]);

        // INSPECTOR 2
        User::create([
            'name' => 'Joko Mechanic',
            'email' => 'joko@otoman.com',
            'phone' => '081555555555',
            'password' => Hash::make('password'),
            'role' => 'inspector',
        ]);

        // USER BIASA
        User::create([
            'name' => 'Ahmad Wijaya',
            'email' => 'ahmad@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);
    }
}