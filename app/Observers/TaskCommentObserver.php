<?php

namespace App\Observers;

use App\Models\TaskComment;

class TaskCommentObserver
{
    /**
     * Handle the TaskComment "created" event.
     */
    public function created(TaskComment $comment): void
    {
        // Logika notifikasi telah dipindahkan ke Job SendNewCommentNotification
        // untuk konsistensi dan keandalan.
    }
}
