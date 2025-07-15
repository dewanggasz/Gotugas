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
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tabel tasks. Jika tugas dihapus, komentarnya juga ikut terhapus.
            $table->foreignId('task_id')->constrained()->onDelete('cascade');

            // Foreign key ke tabel users. Jika user penulis komentar dihapus, catat sebagai "deleted user".
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Kolom untuk menyimpan isi komentar
            $table->text('body');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};
