<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $this->recordActivity('membuat tugas ini', $task);
    }

    /**
     * Handle the Task "updating" event.
     */
    public function updating(Task $task): void
    {
        $original = $task->getOriginal();
        
        if ($task->isDirty('status')) {
            $this->recordActivity(
                "mengubah status dari '{$original['status']}' menjadi '{$task->status}'",
                $task
            );
        }

        if ($task->isDirty('title')) {
            $this->recordActivity("memperbarui judul menjadi '{$task->title}'", $task);
        }

        // --- Pelacakan Baru untuk Deskripsi ---
        if ($task->isDirty('description')) {
            $this->recordActivity("memperbarui deskripsi", $task);
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
   public function deleting(Task $task): void
{
    // INI SOLUSINYA, BERJALAN SEBELUM TUGAS DIHAPUS
    $this->recordActivity('menghapus tugas: ' . $task->title, $task);
}


    /**
     * Helper function untuk mencatat aktivitas.
     */
    protected function recordActivity(string $description, Task $task): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'description' => $description,
        ]);
    }
}
