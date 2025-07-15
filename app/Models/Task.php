<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
        'status' => 'string',
    ];

    /**
     * Relasi untuk mendapatkan user yang MEMBUAT tugas.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi Many-to-Many untuk mendapatkan semua kolaborator.
     */
    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user')
                    ->withPivot('permission');
    }

    /**
     * Relasi untuk mendapatkan semua aktivitas tugas.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->latest();
    }

    /**
     * Relasi untuk mendapatkan semua lampiran tugas.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class)->latest();
    }

    /**
     * Relasi baru untuk mendapatkan semua komentar tugas.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }
}
