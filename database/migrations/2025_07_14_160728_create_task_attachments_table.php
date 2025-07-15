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
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tabel tasks. Jika tugas dihapus, lampirannya juga ikut terhapus.
            $table->foreignId('task_id')->constrained()->onDelete('cascade');

            // Foreign key ke tabel users. Jika user pengunggah dihapus, catat sebagai "deleted user".
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // Jenis lampiran: file, gambar, atau link
            $table->enum('type', ['file', 'image', 'link']);

            // Untuk tipe 'file' dan 'image', menyimpan path di storage
            $table->string('path', 2048)->nullable();
            
            // Untuk tipe 'file' dan 'image', menyimpan nama asli file
            $table->string('original_name')->nullable();
            
            // Untuk tipe 'link', menyimpan URL lengkap
            $table->text('url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
    }
};
