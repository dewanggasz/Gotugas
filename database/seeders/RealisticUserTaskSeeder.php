<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class RealisticUserTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Memulai seeder realistis...');

        // 1. Definisikan struktur pengguna
        $usersData = [
            ['name' => 'Budi Hartono', 'email' => 'ceo@example.com', 'role' => 'admin', 'division' => 'Management'],
            ['name' => 'Citra Lestari', 'email' => 'manager@example.com', 'role' => 'admin', 'division' => 'Management'],
            ['name' => 'Dewi Anggraini', 'email' => 'hr@example.com', 'role' => 'admin', 'division' => 'HR'],
            ['name' => 'Eka Wijaya', 'email' => 'creative@example.com', 'role' => 'employee', 'division' => 'Creative'],
            ['name' => 'Fajar Nugroho', 'email' => 'it.leader@example.com', 'role' => 'employee', 'division' => 'IT'],
            ['name' => 'Gilang Pratama', 'email' => 'it.staff1@example.com', 'role' => 'employee', 'division' => 'IT'],
            ['name' => 'Hana Pertiwi', 'email' => 'it.staff2@example.com', 'role' => 'employee', 'division' => 'IT'],
            ['name' => 'Indra Kusuma', 'email' => 'ga@example.com', 'role' => 'employee', 'division' => 'General Affair'],
            ['name' => 'Joko Susilo', 'email' => 'finance1@example.com', 'role' => 'employee', 'division' => 'Finance'],
            ['name' => 'Kartika Sari', 'email' => 'finance2@example.com', 'role' => 'employee', 'division' => 'Finance'],
            ['name' => 'Lina Marlina', 'email' => 'supervisor@example.com', 'role' => 'employee', 'division' => 'Operations'],
            ['name' => 'Maya Indah', 'email' => 'qa.trainer@example.com', 'role' => 'employee', 'division' => 'Operations'],
        ];

        // 2. Definisikan tugas berdasarkan divisi
        $tasksByDivision = [
            'Management' => [
                'Review laporan keuangan kuartal 3 2024', 'Finalisasi rencana strategis tahun 2025', 'Rapat evaluasi kinerja tahunan', 'Menyiapkan materi presentasi untuk investor'
            ],
            'HR' => [
                'Proses rekrutmen untuk posisi Senior Developer', 'Mengadakan pelatihan kepemimpinan untuk manajer', 'Evaluasi sistem penggajian karyawan', 'Menyiapkan acara outing perusahaan'
            ],
            'Creative' => [
                'Desain kampanye promosi produk baru', 'Membuat konten video untuk media sosial', 'Revisi desain brosur perusahaan', 'Sesi brainstorming untuk ide iklan TV'
            ],
            'IT' => [
                'Migrasi server database ke cloud', 'Patch keamanan untuk semua server aplikasi', 'Pengembangan fitur A untuk aplikasi internal', 'Troubleshooting masalah jaringan di lantai 3', 'Update library frontend ke versi terbaru'
            ],
            'General Affair' => [
                'Pengadaan ATK untuk kuartal 4', 'Perbaikan pendingin ruangan di ruang rapat', 'Manajemen vendor katering', 'Mengatur jadwal kebersihan gedung'
            ],
            'Finance' => [
                'Rekonsiliasi bank akhir bulan', 'Membuat laporan pajak tahunan 2024', 'Proses pembayaran invoice vendor', 'Analisis anggaran departemen'
            ],
            'Operations' => [
                'Audit kualitas produk batch #123', 'Membuat materi pelatihan untuk produk baru', 'Supervisi jadwal shift produksi', 'Analisis laporan keluhan pelanggan'
            ],
        ];

        $statuses = ['not_started', 'in_progress', 'completed', 'cancelled'];
        $allUsers = new \Illuminate\Database\Eloquent\Collection();

        // 3. Buat semua pengguna
        foreach ($usersData as $userData) {
            $user = User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'role' => $userData['role'],
                'password' => Hash::make('password'),
            ]);
            // Simpan data divisi untuk digunakan nanti
            $user->division = $userData['division'];
            $allUsers->push($user);
        }
        $this->command->info(count($usersData) . ' pengguna berhasil dibuat.');

        // 4. Buat tugas untuk setiap pengguna
        foreach ($allUsers as $creator) {
            $divisionTasks = $tasksByDivision[$creator->division] ?? [];
            if (empty($divisionTasks)) continue;

            // Buat 5-10 tugas per pengguna
            for ($i = 0; $i < rand(5, 10); $i++) {
                $task = Task::factory()->create([
                    'user_id' => $creator->id,
                    'title' => $divisionTasks[array_rand($divisionTasks)],
                    'status' => $statuses[array_rand($statuses)],
                    // Buat tanggal dalam 1 tahun terakhir
                    'created_at' => Carbon::now()->subDays(rand(0, 365)),
                    'due_date' => Carbon::now()->addDays(rand(-30, 60)), // Jatuh tempo bisa di masa lalu atau depan
                ]);

                // Tambahkan kolaborator secara acak
                $collaboratorsToSync = [];
                // Pembuat selalu menjadi editor
                $collaboratorsToSync[$creator->id] = ['permission' => 'edit'];

                // Tambahkan 1 atau 2 kolaborator acak lainnya (opsional)
                if (rand(0, 1)) {
                    $collaborators = $allUsers->where('id', '!=', $creator->id)->random(rand(1, 2));
                    foreach ($collaborators as $collaborator) {
                        $collaboratorsToSync[$collaborator->id] = ['permission' => ['view', 'comment', 'edit'][rand(0, 2)]];
                    }
                }
                $task->collaborators()->sync($collaboratorsToSync);
            }
        }
        $this->command->info('Tugas-tugas realistis berhasil dibuat untuk setiap pengguna.');
    }
}
