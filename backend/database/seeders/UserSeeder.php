<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'username' => 'admin',
                'name' => 'Admin User',
                'email' => 'admin@sariph.local',
                'password' => 'Admin@123',
                'role' => 'Administrator',
            ],
            [
                'username' => 'supervisor1',
                'name' => 'Supervisor One',
                'email' => 'supervisor@sariph.local',
                'password' => 'Supervisor@123',
                'role' => 'Supervisor',
            ],
            [
                'username' => 'cashier1',
                'name' => 'Cashier One',
                'email' => 'cashier@sariph.local',
                'password' => 'Cashier@123',
                'role' => 'Cashier',
            ],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['username' => $user['username']],
                [
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'password' => Hash::make($user['password']),
                    'role' => $user['role'],
                    'status' => 'Active',
                    'is_temp_password' => false,
                ]
            );
        }
    }
}
