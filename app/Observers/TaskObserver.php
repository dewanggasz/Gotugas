<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     * Observer ini sekarang hanya bertanggung jawab untuk mencatat aktivitas.
     */
    public function created(Task $task): void
    {
        $this->recordActivity('membuat tugas ini', $task, Auth::id());
    }

    /**
     * Handle the Task "updating" event.
     */
    public function updating(Task $task): void
    {
        if (!Auth::check()) return;

        $original = $task->getOriginal();
        
        if ($task->isDirty('status')) {
            $this->recordActivity("mengubah status dari '{$original['status']}' menjadi '{$task->status}'", $task, Auth::id());
        }

        if ($task->isDirty('title')) {
            $this->recordActivity("memperbarui judul menjadi '{$task->title}'", $task, Auth::id());
        }

        if ($task->isDirty('description')) {
            $this->recordActivity("memperbarui deskripsi", $task, Auth::id());
        }
    }

    /**
     * Handle the Task "deleting" event.
     */
    public function deleting(Task $task): void
    {
        if (Auth::check()) {
            $this->recordActivity('menghapus tugas: ' . $task->title, $task, Auth::id());
        }
    }

    /**
     * Helper function untuk mencatat aktivitas.
     */
    protected function recordActivity(string $description, Task $task, ?int $userId): void
    {
        if (!$userId) return;

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $userId,
            'description' => $description,
        ]);
    }
}
