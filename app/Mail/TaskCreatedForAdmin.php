<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskCreatedForAdmin extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Task $task;
    public User $creator;

    /**
     * Create a new message instance.
     * PERBAIKAN: Konstruktor sekarang hanya menerima ID (int).
     */
    public function __construct(public int $taskId)
    {
        // Ambil data segar dari database menggunakan ID
        $this->task = Task::with('user')->findOrFail($this->taskId);
        $this->creator = $this->task->user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->creator->name} membuat tugas baru: {$this->task->title}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tasks.created-for-admin',
            with: [
                'assigner' => $this->creator,
            ],
        );
    }
}
