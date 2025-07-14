<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskActivity extends Model
{
    use HasFactory;

    // Kita hanya menggunakan created_at, jadi nonaktifkan updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'task_id',
        'user_id',
        'description',
    ];

    /**
     * Dapatkan tugas yang terkait dengan aktivitas ini.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Dapatkan pengguna yang melakukan aktivitas ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
