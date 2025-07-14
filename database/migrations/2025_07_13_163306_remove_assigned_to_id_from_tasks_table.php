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
            // Periksa jika kolomnya ada sebelum mencoba menghapusnya
            if (Schema::hasColumn('tasks', 'assigned_to_id')) {
                // Hapus foreign key constraint terlebih dahulu
                $table->dropForeign(['assigned_to_id']);
                // Hapus kolomnya
                $table->dropColumn('assigned_to_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     * (Untuk mengembalikan jika terjadi kesalahan)
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assigned_to_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->after('user_id');
        });
    }
};