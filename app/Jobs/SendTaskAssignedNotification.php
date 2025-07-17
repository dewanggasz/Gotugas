<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use App\Mail\TaskAssigned;
use App\Mail\TaskCreatedForAdmin;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTaskAssignedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     * PERBAIKAN: Konstruktor sekarang hanya menerima ID (int), bukan objek Task.
     */
    public function __construct(protected int $taskId, protected ?array $newCollaboratorIds = null)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Ambil data segar dari database menggunakan ID
        $task = Task::with('user', 'collaborators')->findOrFail($this->taskId);
        $creator = $task->user;

        // Tentukan penerima
        $recipients = $this->newCollaboratorIds
            ? User::findMany($this->newCollaboratorIds)
            : $task->collaborators;

        // Kirim notifikasi ke kolaborator
        foreach ($recipients as $recipient) {
            if ($recipient->id !== $creator->id) {
                // Kirim hanya ID tugas ke Mailable
                Mail::to($recipient->email)->send(new TaskAssigned($task->id));
            }
        }

        // Kirim notifikasi ke admin HANYA saat tugas baru dibuat
        if (!$this->newCollaboratorIds) {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                if ($admin->id !== $creator->id && !$task->collaborators->contains('id', $admin->id)) {
                    // Kirim hanya ID tugas ke Mailable admin
                    Mail::to($admin->email)->send(new TaskCreatedForAdmin($task->id));
                }
            }
        }
    }
}
