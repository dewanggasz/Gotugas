<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewCommentOnTask extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Task $task;
    public User $commenter;
    public TaskComment $comment;

    /**
     * Create a new message instance.
     *
     * @param \App\Models\TaskComment $comment
     */
    public function __construct(TaskComment $comment)
    {
        // --- PERBAIKAN ---
        // Saat job dijalankan oleh worker, relasi mungkin belum dimuat.
        // 'loadMissing' akan memuat relasi HANYA jika belum ada,
        // ini membuatnya aman dan efisien.
        $comment->loadMissing(['task', 'user']);

        $this->comment = $comment;
        $this->task = $this->comment->task;
        $this->commenter = $this->comment->user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Komentar Baru pada Tugas: ' . $this->task->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tasks.new-comment',
        );
    }
}
