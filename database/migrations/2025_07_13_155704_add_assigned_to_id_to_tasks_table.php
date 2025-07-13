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
        Schema::table('tasks', function (Blueprint $table) {
            // Tambahkan kolom baru setelah kolom 'user_id'
            $table->foreignId('assigned_to_id')
                  ->nullable() // Bisa dikosongkan (jika tugas untuk diri sendiri)
                  ->constrained('users') // Foreign key ke tabel users
                  ->onDelete('set null') // Jika user yang ditugaskan dihapus, set kolom ini menjadi null
                  ->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Hapus foreign key constraint terlebih dahulu
            $table->dropForeign(['assigned_to_id']);
            // Hapus kolomnya
            $table->dropColumn('assigned_to_id');
        });
    }
};
