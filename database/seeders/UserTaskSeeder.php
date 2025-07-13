<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Hapus data lama untuk memastikan kebersihan data (opsional)
        // Task::query()->delete();
        // User::query()->delete();

        // 2. Buat Pengguna Admin
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'), // password: password
            'role' => 'admin',
        ]);
        $this->command->info('Admin user created: admin@example.com');

        // 3. Buat beberapa Pengguna Karyawan
        $employees = User::factory(5)->create([
            'password' => Hash::make('password'), // password: password
            'role' => 'employee',
        ]);
        $this->command->info('5 employee users created.');

        // 4. Buat Tugas untuk setiap Karyawan
        $statuses = ['not_started', 'in_progress', 'completed', 'cancelled'];

        foreach ($employees as $employee) {
            // Buat 10-20 tugas untuk setiap karyawan
            $numberOfTasks = rand(10, 20);
            for ($i = 0; $i < $numberOfTasks; $i++) {
                Task::factory()->create([
                    'user_id' => $employee->id,
                    'title' => 'Tugas ' . ($i + 1) . ' untuk ' . $employee->name,
                    'description' => 'Ini adalah deskripsi detail untuk tugas ini.',
                    'status' => $statuses[array_rand($statuses)],
                    // Buat tanggal dalam 3 bulan terakhir untuk pengujian filter
                    'created_at' => now()->subDays(rand(0, 90)),
                ]);
            }
        }
        $this->command->info('Tasks created for each employee.');
    }
}
