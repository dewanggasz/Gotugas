<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_notes', function (Blueprint $table) {
            // Tambahkan kolom title setelah journal_id
            $table->string('title')->after('journal_id');
        });
    }

    public function down(): void
    {
        Schema::table('journal_notes', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};