<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin OTOMAN',
            'email' => 'admin@otoman.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);
    }
}