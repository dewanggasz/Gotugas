<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Daftar status yang mungkin untuk sebuah tugas
        $statuses = ['not_started', 'in_progress', 'completed', 'cancelled'];

        return [
            // Kita tidak perlu mendefinisikan user_id di sini karena
            // kita akan menentukannya saat memanggil factory di seeder.
            'title' => $this->faker->sentence(4), // Membuat judul acak
            'description' => $this->faker->paragraph(2), // Membuat deskripsi acak
            'status' => $statuses[array_rand($statuses)], // Memilih status acak
            'due_date' => $this->faker->optional()->dateTimeBetween('now', '+3 months'), // Tanggal jatuh tempo acak (opsional)
        ];
    }
}
