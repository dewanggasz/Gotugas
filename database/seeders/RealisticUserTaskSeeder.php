<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\Journal;
use App\Models\JournalNote;
use Illuminate\Support\Carbon;

class RealisticUserTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Memulai seeder data besar dengan logika realistis...');

        // === Konfigurasi Utama ===
        $numberOfUsers = 500;
        $tasksPerUser = rand(50, 100);

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
        
        $this->command->info("Membuat {$numberOfUsers} pengguna...");
        
        // Buat semua pengguna terlebih dahulu
        User::factory()->count($numberOfUsers)->create();
        $allUsers = User::all();
        
        $this->command->info("Pengguna berhasil dibuat. Mempersiapkan data lainnya...");

        // =================================================================
        // === Langkah 1: Membuat Data Jurnal dan Catatan Harian (Didahulukan) ===
        // =================================================================
        $this->command->info('Membuat data jurnal dan catatan harian...');

        foreach ($allUsers as $user) {
            for ($d = 0; $d < 365; $d++) {
                if (rand(0, 5) === 0) continue;

                $journal = Journal::factory()->create([
                    'user_id' => $user->id,
                    'entry_date' => Carbon::now()->subDays($d),
                ]);

                if (rand(0, 3) > 0) {
                    JournalNote::factory()->count(rand(1, 2))->create([
                        'journal_id' => $journal->id,
                    ]);
                }
            }
        }
        $this->command->info('Jurnal dan catatan harian berhasil dibuat.');
        
        // =================================================================
        // === Langkah 2: Membuat Data Tugas dan Kolaborator ===
        // =================================================================
        $this->command->info('Memulai pembuatan tugas dan kolaborator...');

        foreach ($allUsers as $creator) {
            $creator->division = $divisions[array_rand($divisions)];
            $creator->role = rand(1, 10) > 8 ? 'admin' : 'employee';
            $creator->save();
            
            $divisionTasks = $tasksByDivision[$creator->division];

            for ($i = 0; $i < $tasksPerUser; $i++) {
                $task = Task::factory()->create([
                    'user_id' => $creator->id,
                    'title' => $divisionTasks[array_rand($divisionTasks)] . " (#" . rand(1,1000) . ")",
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => Carbon::now()->subDays(rand(0, 730)),
                    'due_date' => Carbon::now()->addDays(rand(-60, 180)),
                ]);

                $collaboratorsToSync = [];
                $collaboratorsToSync[$creator->id] = ['permission' => 'edit'];

                if (rand(0, 1)) {
                    $collaborators = $allUsers->where('id', '!=', $creator->id)->random(rand(1, 2));
                    foreach ($collaborators as $collaborator) {
                        $collaboratorsToSync[$collaborator->id] = ['permission' => ['view', 'comment', 'edit'][rand(0, 2)]];
                    }
                }
                $task->collaborators()->sync($collaboratorsToSync);
            }
        }
        $this->command->info('Tugas dan kolaborator selesai dibuat.');

        $this->command->info("SELESAI! Semua data realistis berhasil dibuat.");
    }
}