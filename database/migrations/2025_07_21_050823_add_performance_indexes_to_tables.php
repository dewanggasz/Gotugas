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
        // Indeks untuk tabel `tasks`
        Schema::table('tasks', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('due_date');
        });

        // Indeks untuk tabel `users`
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });

        // Indeks untuk tabel `journals`
        Schema::table('journals', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('entry_date');
            $table->index('mood');
        });

        // Indeks untuk tabel pivot kolaborator (asumsi nama: task_user)
        // **PENTING**: Sesuaikan 'task_user' dengan nama tabel pivot Anda jika berbeda.
        if (Schema::hasTable('task_user')) {
             Schema::table('task_user', function (Blueprint $table) {
                $table->index('user_id');
                $table->index('task_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['due_date']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('journals', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['entry_date']);
            $table->dropIndex(['mood']);
        });
        
        if (Schema::hasTable('task_user')) {
            Schema::table('task_user', function (Blueprint $table) {
                $table->dropIndex(['user_id']);
                $table->dropIndex(['task_id']);
            });
        }
    }
};