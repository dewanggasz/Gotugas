<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\User; // <-- Impor model User
use App\Models\TaskActivity;
use App\Mail\TaskCompletedNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
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
            $this->recordActivity(
                "mengubah status dari '{$original['status']}' menjadi '{$task->status}'",
                $task,
                Auth::id()
            );

            // Kirim notifikasi HANYA jika status baru adalah 'completed'
            if ($task->status === 'completed') {
                $this->sendCompletionNotification($task);
            }
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

    /**
     * Helper function baru untuk mengirim notifikasi penyelesaian tugas.
     */
    protected function sendCompletionNotification(Task $task): void
    {
        // Pengguna yang sedang login adalah yang menyelesaikan tugas
        $completer = Auth::user();
        if (!$completer) {
            return; // Keluar jika tidak ada pengguna yang terautentikasi
        }

        // Muat relasi pembuat dan kolaborator
        $task->load('user', 'collaborators');

        // Ambil pembuat tugas dan semua kolaborator
        $teamMembers = $task->collaborators->push($task->user);

        // Ambil semua pengguna dengan peran 'admin'
        $admins = User::where('role', 'admin')->get();

        // Gabungkan semua daftar penerima dan pastikan unik
        $recipients = $teamMembers->merge($admins)->unique('id');

        foreach ($recipients as $recipient) {
            // Jangan kirim notifikasi ke orang yang baru saja menyelesaikan tugas
            if ($recipient->id === $completer->id) {
                continue;
            }

            // Kirim email notifikasi
            Mail::to($recipient->email)
                ->queue(new TaskCompletedNotification($task, $completer, $recipient));
        }
    }
}
