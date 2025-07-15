<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TaskCommentResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskCommentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Mengambil daftar komentar untuk sebuah tugas.
     */
    public function index(Task $task)
    {
        $this->authorize('view', $task);

        // --- PERBAIKAN: Eager load balasan secara rekursif ---
        $comments = $task->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies' => function ($query) {
                $query->with(['user', 'replies.user']); // Muat balasan dan user pembuatnya
            }])
            ->get();

        return TaskCommentResource::collection($comments);
    }

    /**
     * Simpan komentar baru untuk sebuah tugas.
     */
    public function store(Request $request, Task $task)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $this->authorize('comment', $task);

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:task_comments,id',
        ]);

        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'body' => $validated['body'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $task->activities()->create([
            'user_id' => $user->id,
            'description' => $validated['parent_id'] ? "membalas sebuah komentar" : "menambahkan komentar",
        ]);

        return new TaskCommentResource($comment->load('user'));
    }
}
