<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'body',
        'parent_id', // <-- Tambahkan ini
    ];

    /**
     * Dapatkan tugas yang terkait dengan komentar ini.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Dapatkan pengguna yang menulis komentar ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dapatkan komentar induk (jika ini adalah balasan).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(TaskComment::class, 'parent_id');
    }

    /**
     * Dapatkan semua balasan untuk komentar ini.
     */
    public function replies(): HasMany
    {
        // Urutkan balasan dari yang terlama ke terbaru
        return $this->hasMany(TaskComment::class, 'parent_id')->oldest();
    }
}
