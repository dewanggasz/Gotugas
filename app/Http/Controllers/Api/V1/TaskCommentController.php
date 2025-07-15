<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TaskCommentResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // 1. Import trait

class TaskCommentController extends Controller
{
    use AuthorizesRequests; // 2. Gunakan trait

    /**
     * Mengambil daftar komentar untuk sebuah tugas.
     */
    public function index(Task $task)
    {
        $this->authorize('view', $task);

        $comments = $task->comments()->with('user')->paginate(10);

        return TaskCommentResource::collection($comments);
    }

    /**
     * Simpan komentar baru untuk sebuah tugas.
     */
    public function store(Request $request, Task $task)
    {
        /** @var \App\Models\User $user */ // 3. Tambahkan docblock untuk type hinting
        $user = Auth::user();

        // Otorisasi: Hanya admin yang bisa berkomentar
        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang dapat menambahkan komentar.');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Catat aktivitas penambahan komentar
        $task->activities()->create([
            'user_id' => $user->id,
            'description' => "menambahkan komentar",
        ]);

        return new TaskCommentResource($comment->load('user'));
    }
}
