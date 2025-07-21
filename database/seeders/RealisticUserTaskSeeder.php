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
        $this->command->info('Memulai seeder data besar dengan logika realistis...');

        // === Konfigurasi Utama ===
        $numberOfUsers = 20;
        $tasksPerUser = rand(20, 200);

        // 1. Definisikan tugas berdasarkan divisi
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
        
        // 2. Buat semua pengguna terlebih dahulu, lalu ambil koleksinya
        User::factory()->count($numberOfUsers)->create();
        $allUsers = User::all();
        
        $this->command->info("Pengguna berhasil dibuat. Memulai pembuatan tugas dan kolaborator...");

        // 3. Loop setiap pengguna untuk memberikan detail dan membuat tugas
        // Kita menggunakan $creator untuk konsistensi dengan logika kolaborator asli Anda
        foreach ($allUsers as $creator) {
            // Beri divisi dan role acak
            $creator->division = $divisions[array_rand($divisions)];
            $creator->role = rand(1, 10) > 8 ? 'admin' : 'employee';
            $creator->save();

            $divisionTasks = $tasksByDivision[$creator->division];

            // Buat sejumlah tugas untuk pengguna ini
            for ($i = 0; $i < $tasksPerUser; $i++) {
                $task = Task::factory()->create([
                    'user_id' => $creator->id,
                    'title' => $divisionTasks[array_rand($divisionTasks)] . " (#" . rand(1,1000) . ")",
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => Carbon::now()->subDays(rand(0, 730)),
                    'due_date' => Carbon::now()->addDays(rand(-60, 180)),
                ]);

                // === LOGIKA KOLABORATOR DIKEMBALIKAN SEPERTI ASLI ===
                $collaboratorsToSync = [];
                // Pembuat tugas selalu menjadi 'editor'
                $collaboratorsToSync[$creator->id] = ['permission' => 'edit'];

                // Tambahkan 1 atau 2 kolaborator acak lainnya (opsional)
                if (rand(0, 1)) {
                    // Ambil pengguna lain selain si pembuat tugas
                    $collaborators = $allUsers->where('id', '!=', $creator->id)->random(rand(1, 2));
                    foreach ($collaborators as $collaborator) {
                        // Beri izin acak antara 'view', 'comment', atau 'edit'
                        $collaboratorsToSync[$collaborator->id] = ['permission' => ['view', 'comment', 'edit'][rand(0, 2)]];
                    }
                }
                // Sinkronisasikan kolaborator ke dalam tabel pivot
                $task->collaborators()->sync($collaboratorsToSync);
            }
        }

        $this->command->info("SELESAI! Semua data realistis, termasuk kolaborator, berhasil dibuat.");
    }
}