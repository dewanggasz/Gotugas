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
        Schema::create('task_user', function (Blueprint $table) {
            // Kunci utama gabungan untuk mencegah duplikasi
            $table->primary(['task_id', 'user_id']);

            // Foreign key ke tabel tasks
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            
            // Foreign key ke tabel users
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Kolom untuk menyimpan izin ('edit' atau 'view')
            $table->enum('permission', ['edit', 'view'])->default('view');

            // Timestamps tidak diperlukan untuk tabel pivot sederhana ini
            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_user');
    }
};
