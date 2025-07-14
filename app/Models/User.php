<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => 'string',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Relasi untuk tugas yang DIBUAT oleh pengguna ini.
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'user_id');
    }

    /**
     * Relasi Many-to-Many baru untuk mendapatkan semua tugas
     * di mana pengguna ini menjadi kolaborator.
     */
    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_user')
                    ->withPivot('permission'); // Hapus ->withTimestamps()
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
