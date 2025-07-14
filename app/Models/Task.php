<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'due_date' => 'date',
        'status' => 'string',
    ];

    public function activities()
    {
        // Urutkan dari yang terbaru
        return $this->hasMany(TaskActivity::class)->latest();
    }

    /**
     * Relasi untuk mendapatkan user yang MEMBUAT tugas.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi Many-to-Many baru untuk mendapatkan semua kolaborator.
     */
    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user')
                    ->withPivot('permission'); // Hapus ->withTimestamps()
    }
}