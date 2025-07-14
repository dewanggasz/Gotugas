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
        Schema::create('task_activities', function (Blueprint $table) {
            $table->id();
            
            // Foreign key ke tabel tasks. Jika tugas dihapus, aktivitasnya juga ikut terhapus.
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            
            // Foreign key ke tabel users. Jika user dihapus, catat sebagai "deleted user".
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Kolom untuk menyimpan deskripsi aktivitas
            $table->string('description');
            
            // Hanya perlu created_at, karena log aktivitas tidak pernah di-update
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_activities');
    }
};
