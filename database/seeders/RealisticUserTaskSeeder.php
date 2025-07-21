<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\Journal;
use App\Models\JournalNote;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class RealisticUserTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Memulai seeder data besar dengan logika realistis...');

        // === 1. Konfigurasi dan Pembuatan Pengguna ===
        $this->command->info("Membuat 20 pengguna dengan peran spesifik...");

        // Hapus pengguna lama untuk memastikan kebersihan data
        User::query()->delete();

        // Buat 2 Admin
        User::factory()->create([
            'name' => 'Admin Utama',
            'email' => 'admin@taskwise.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        User::factory()->create([
            'name' => 'Admin Cadangan',
            'email' => 'admin2@taskwise.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Buat 3 Semi-Admin
        User::factory()->count(3)->create(['role' => 'semi_admin']);

        // Buat 15 Employee
        User::factory()->count(15)->create(['role' => 'employee']);
        
        $allUsers = User::all();
        $nonAdminUsers = $allUsers->whereNotIn('role', ['admin']);
        $this->command->info("Total {$allUsers->count()} pengguna berhasil dibuat.");


        // === 2. Membuat Data Jurnal & Mood Realistis ===
        $this->command->info('Membuat data jurnal dan mood untuk pengguna non-admin...');
        $journalProgressBar = $this->command->getOutput()->createProgressBar($nonAdminUsers->count());
        $journalProgressBar->start();

        foreach ($nonAdminUsers as $user) {
            // Buat entri jurnal untuk sebagian besar hari dalam 2 tahun terakhir
            for ($d = 0; $d < 730; $d++) {
                // 85% kemungkinan ada entri jurnal pada satu hari
                if (rand(1, 100) <= 85) {
                    $entryDate = Carbon::now()->subDays($d);
                    $journal = Journal::factory()->create([
                        'user_id' => $user->id,
                        'entry_date' => $entryDate,
                    ]);

                    // 40% kemungkinan jurnal memiliki catatan tambahan
                    if (rand(1, 100) <= 40) {
                        JournalNote::factory()->count(rand(1, 3))->create([
                            'journal_id' => $journal->id,
                        ]);
                    }
                }
            }
            $journalProgressBar->advance();
        }
        $journalProgressBar->finish();
        $this->command->info("\nData jurnal berhasil dibuat.");


        // === 3. Membuat Data Tugas Skala Besar ===
        $this->command->info('Memulai pembuatan tugas skala besar...');
        $tasksPerUserRange = [1800, 2500]; // Rentang tugas per pengguna agar totalnya > 40.000
        $tasksByDivision = [
            'Management' => ['Review laporan keuangan', 'Finalisasi rencana strategis', 'Rapat evaluasi kinerja', 'Menyiapkan materi presentasi investor'],
            'HR' => ['Proses rekrutmen', 'Mengadakan pelatihan kepemimpinan', 'Evaluasi sistem penggajian', 'Menyiapkan acara outing'],
            'Creative' => ['Desain kampanye promosi', 'Membuat konten video', 'Revisi desain brosur', 'Sesi brainstorming ide iklan'],
            'IT' => ['Migrasi server database', 'Patch keamanan server', 'Pengembangan fitur baru', 'Troubleshooting masalah jaringan', 'Update library frontend'],
            'General Affair' => ['Pengadaan ATK', 'Perbaikan pendingin ruangan', 'Manajemen vendor katering', 'Mengatur jadwal kebersihan'],
            'Finance' => ['Rekonsiliasi bank', 'Membuat laporan pajak', 'Proses pembayaran invoice', 'Analisis anggaran departemen'],
            'Operations' => ['Audit kualitas produk', 'Membuat materi pelatihan', 'Supervisi jadwal shift', 'Analisis laporan keluhan'],
        ];
        $divisions = array_keys($tasksByDivision);
        $statuses = ['not_started', 'in_progress', 'completed', 'cancelled'];
        $priorities = ['low', 'medium', 'high'];

        $taskProgressBar = $this->command->getOutput()->createProgressBar($allUsers->count());
        $taskProgressBar->start();

        foreach ($allUsers as $creator) {
            $creator->division = fake()->randomElement($divisions);
            $creator->save();
            
            $divisionTasks = $tasksByDivision[$creator->division];
            $tasksToCreate = rand($tasksPerUserRange[0], $tasksPerUserRange[1]);

            for ($i = 0; $i < $tasksToCreate; $i++) {
                $createdAt = Carbon::now()->subDays(rand(1, 730));
                $dueDate = $createdAt->copy()->addDays(rand(5, 60));
                $status = $statuses[array_rand($statuses)];
                $updatedAt = $createdAt;

                if ($status === 'completed') {
                    if (rand(1, 10) <= 8) {
                        $updatedAt = fake()->dateTimeBetween($createdAt, $dueDate);
                    } else {
                        $updatedAt = $dueDate->copy()->addDays(rand(1, 15));
                    }
                }

                $task = Task::factory()->create([
                    'user_id' => $creator->id,
                    'title' => $divisionTasks[array_rand($divisionTasks)] . " (#" . rand(1, 1000) . ")",
                    'status' => $status,
                    'priority' => $priorities[array_rand($priorities)],
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                    'due_date' => $dueDate,
                ]);

                $collaboratorsToSync = [];
                $collaboratorsToSync[$creator->id] = ['permission' => 'edit'];

                // Tambahkan hingga 2 kolaborator acak
                if (rand(0, 1)) {
                    $collaborators = $allUsers->where('id', '!=', $creator->id)->random(rand(1, 2));
                    foreach ($collaborators as $collaborator) {
                        $collaboratorsToSync[$collaborator->id] = ['permission' => ['view', 'comment', 'edit'][rand(0, 2)]];
                    }
                }
                $task->collaborators()->sync($collaboratorsToSync);
            }
            $taskProgressBar->advance();
        }
        $taskProgressBar->finish();
        $this->command->info("\nSELESAI! Semua data realistis skala besar berhasil dibuat.");
    }
}
