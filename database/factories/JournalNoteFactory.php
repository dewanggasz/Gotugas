<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalNote>
 */
class JournalNoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Daftar warna yang bisa dipilih secara acak
        $colors = ['default', 'red', 'green', 'blue', 'yellow', 'purple'];

        return [
            // journal_id akan kita tentukan saat memanggil factory di Seeder
            'title' => $this->faker->sentence(5), // Membuat judul acak
            'content' => $this->faker->text(250), // Membuat konten acak
            'color' => $this->faker->randomElement($colors), // Memilih warna acak
        ];
    }
}