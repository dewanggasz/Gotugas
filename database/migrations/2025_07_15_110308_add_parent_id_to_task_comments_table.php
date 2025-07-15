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
        Schema::table('task_comments', function (Blueprint $table) {
            // Tambahkan kolom parent_id setelah user_id
            $table->foreignId('parent_id')
                  ->nullable() // Bisa null jika ini adalah komentar utama
                  ->constrained('task_comments') // Foreign key ke tabel itu sendiri
                  ->onDelete('cascade') // Jika komentar utama dihapus, balasannya juga ikut terhapus
                  ->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
};
