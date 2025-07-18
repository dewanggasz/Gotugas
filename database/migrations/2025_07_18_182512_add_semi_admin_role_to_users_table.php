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
        Schema::table('users', function (Blueprint $table) {
            // Mengubah kolom enum untuk menambahkan 'semi_admin'
            // Pastikan urutan dan nilai default sesuai dengan kebutuhan Anda
            $table->enum('role', ['admin', 'semi_admin', 'employee'])->default('employee')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Mengembalikan ke keadaan semula jika di-rollback
            $table->enum('role', ['admin', 'employee'])->default('employee')->change();
        });
    }
};
