<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            // Menghubungkan setiap entri jurnal ke seorang pengguna
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('entry_date'); // Tanggal entri jurnal
            $table->text('content')->nullable(); // Isi catatan, boleh kosong
            $table->string('mood')->nullable(); // Untuk menyimpan mood (misal: 'happy', 'sad')
            $table->timestamps();

            // Menambahkan unique index untuk memastikan setiap pengguna
            // hanya memiliki satu entri per tanggal.
            $table->unique(['user_id', 'entry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};
