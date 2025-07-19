<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; 

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'entry_date',
        'mood',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // --- TAMBAHKAN RELASI BARU DI SINI ---
    public function notes(): HasMany
    {
        return $this->hasMany(JournalNote::class);
    }
}
