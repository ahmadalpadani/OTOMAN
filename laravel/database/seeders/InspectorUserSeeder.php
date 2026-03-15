<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Mechanic;
use Illuminate\Support\Facades\Hash;

class InspectorUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create inspector users dan link ke mechanics table

        $inspectors = [
            [
                'user' => [
                    'name' => 'Budi Teknisi',
                    'email' => 'budi@otoman.com',
                    'password' => Hash::make('inspector123'),
                    'phone' => '081987654321',
                    'role' => 'inspector',
                ],
                'mechanic' => [
                    'name' => 'Budi Teknisi',
                    'phone' => '081987654321',
                    'specialization' => 'Mobil - Mesin & Body',
                    'is_active' => true,
                ],
            ],
            [
                'user' => [
                    'name' => 'Joko Mechanic',
                    'email' => 'joko@otoman.com',
                    'password' => Hash::make('inspector123'),
                    'phone' => '081555555555',
                    'role' => 'inspector',
                ],
                'mechanic' => [
                    'name' => 'Joko Mechanic',
                    'phone' => '081555555555',
                    'specialization' => 'Mobil - Listrik & Elektronik',
                    'is_active' => true,
                ],
            ],
            [
                'user' => [
                    'name' => 'Asep Service',
                    'email' => 'asep@otoman.com',
                    'password' => Hash::make('inspector123'),
                    'phone' => '081333333333',
                    'role' => 'inspector',
                ],
                'mechanic' => [
                    'name' => 'Asep Service',
                    'phone' => '081333333333',
                    'specialization' => 'Motor - Mesin',
                    'is_active' => true,
                ],
            ],
            [
                'user' => [
                    'name' => 'Dedi Inspector',
                    'email' => 'dedi@otoman.com',
                    'password' => Hash::make('inspector123'),
                    'phone' => '081222222222',
                    'role' => 'inspector',
                ],
                'mechanic' => [
                    'name' => 'Dedi Inspector',
                    'phone' => '081222222222',
                    'specialization' => 'Mobil - Interior & Body',
                    'is_active' => true,
                ],
            ],
            [
                'user' => [
                    'name' => 'Rudi Teknisi',
                    'email' => 'rudi@otoman.com',
                    'password' => Hash::make('inspector123'),
                    'phone' => '081111111111',
                    'role' => 'inspector',
                ],
                'mechanic' => [
                    'name' => 'Rudi Teknisi',
                    'phone' => '081111111111',
                    'specialization' => 'Mobil & Motor - All Round',
                    'is_active' => true,
                ],
            ],
        ];

        foreach ($inspectors as $inspector) {
            // Create user dengan role inspector
            $user = User::create($inspector['user']);

            // Create mechanic record linked ke user
            Mechanic::create([
                'user_id' => $user->id,
                'name' => $inspector['mechanic']['name'],
                'phone' => $inspector['mechanic']['phone'],
                'specialization' => $inspector['mechanic']['specialization'],
                'is_active' => $inspector['mechanic']['is_active'],
            ]);
        }

        $this->command->info('Seeder inspector selesai! berikut data login:');
        $this->command->info('Email: budi@otoman.com | Password: inspector123');
        $this->command->info('Email: joko@otoman.com | Password: inspector123');
        $this->command->info('Email: asep@otoman.com | Password: inspector123');
        $this->command->info('Email: dedi@otoman.com | Password: inspector123');
        $this->command->info('Email: rudi@otoman.com | Password: inspector123');
    }
}