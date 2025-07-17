<?php

namespace App\Jobs;

use App\Models\TaskComment;
use App\Mail\NewCommentOnTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNewCommentNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The comment instance.
     *
     * @var \App\Models\TaskComment
     */
    protected $comment;

    /**
     * Create a new job instance.
     */
    public function __construct(TaskComment $comment)
    {
        $this->comment = $comment;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Muat relasi yang diperlukan untuk memastikan datanya ada
        $this->comment->loadMissing(['task.collaborators', 'user']);

        $task = $this->comment->task;
        $commenter = $this->comment->user;

        foreach ($task->collaborators as $collaborator) {
            // Kirim email HANYA jika kolaborator bukan orang yang membuat komentar
            if ($collaborator->id !== $commenter->id) {
                Mail::to($collaborator->email)
                    ->send(new NewCommentOnTask($this->comment));
            }
        }
    }
}
