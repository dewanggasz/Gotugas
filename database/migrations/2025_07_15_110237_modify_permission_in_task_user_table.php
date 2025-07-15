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
        Schema::table('task_user', function (Blueprint $table) {
            // Ubah kolom enum untuk menambahkan 'comment'
            $table->enum('permission', ['edit', 'view', 'comment'])->default('view')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_user', function (Blueprint $table) {
            // Kembalikan ke keadaan semula jika di-rollback
            $table->enum('permission', ['edit', 'view'])->default('view')->change();
        });
    }
};
