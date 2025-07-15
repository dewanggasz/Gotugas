<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'type',
        'path',
        'original_name',
        'url',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'file_url',
    ];

    /**
     * Get the full URL to the attachment file.
     */
    public function getFileUrlAttribute()
    {
        if ($this->type === 'file' || $this->type === 'image') {
            if ($this->path) {
                /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                $disk = Storage::disk('public');
                return $disk->url($this->path);
            }
            return null;
        }

        return $this->url; // Untuk tipe 'link'
    }

    /**
     * Dapatkan tugas yang terkait dengan lampiran ini.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Dapatkan pengguna yang mengunggah lampiran ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
