<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Journal>
 */
class JournalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Daftar mood yang bisa dipilih secara acak
        $moods = ['joyful', 'excited', 'happy', 'neutral', 'sad'];

        return [
            // user_id dan entry_date akan kita tentukan saat memanggil factory di Seeder
            
            'mood' => $this->faker->randomElement($moods), // Memilih satu elemen acak dari array $moods
        ];
    }
}