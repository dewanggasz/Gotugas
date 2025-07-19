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
        // Langkah 1: Ubah tabel 'journals' yang ada
        Schema::table('journals', function (Blueprint $table) {
            // Hapus kolom konten karena akan dipindahkan
            $table->dropColumn('content');
        });

        // Langkah 2: Buat tabel baru untuk setiap catatan
        Schema::create('journal_notes', function (Blueprint $table) {
            $table->id();
            // Hubungkan setiap catatan ke entri jurnal harian
            $table->foreignId('journal_id')->constrained()->onDelete('cascade');
            $table->text('content'); // Isi dari catatan spesifik
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_notes');

        Schema::table('journals', function (Blueprint $table) {
            $table->text('content')->nullable()->after('mood');
        });
    }
};
