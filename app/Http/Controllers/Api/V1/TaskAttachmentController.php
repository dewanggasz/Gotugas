<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskAttachmentController extends Controller
{
    use AuthorizesRequests;
    /**
     * Simpan lampiran baru untuk sebuah tugas.
     */
    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        // --- PERBAIKAN: Mengganti nama 'type' menjadi 'attachment_type' ---
        $validated = $request->validate([
            'attachment_type' => ['required', Rule::in(['file', 'image', 'link'])],
            'file' => ['required_if:attachment_type,file,image', 'file', 'max:5120'],
            'url' => ['required_if:attachment_type,link', 'url', 'max:2048'],
        ]);

        $user = Auth::user();
        $attachmentData = [
            'task_id' => $task->id,
            'user_id' => $user->id,
            'type' => $validated['attachment_type'], // Simpan ke kolom 'type' di database
        ];

        $originalName = 'link';

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("attachments/{$task->id}", 'public');
            $attachmentData['path'] = $path;
            $originalName = $file->getClientOriginalName();
            $attachmentData['original_name'] = $originalName;
        } elseif ($validated['attachment_type'] === 'link') {
            $attachmentData['url'] = $validated['url'];
            $attachmentData['original_name'] = $validated['url'];
            $originalName = $validated['url'];
        }

        $attachment = TaskAttachment::create($attachmentData);

        $task->activities()->create([
            'user_id' => $user->id,
            'description' => "menambahkan lampiran: '{$originalName}'"
        ]);

        return response()->json($attachment->load('user'), 201);
    }

    /**
     * Hapus lampiran.
     */
    public function destroy(TaskAttachment $attachment)
    {
        $task = $attachment->task;
        $this->authorize('update', $task);

        $task->activities()->create([
            'user_id' => Auth::id(),
            'description' => "menghapus lampiran: '{$attachment->original_name}'"
        ]);

        if ($attachment->path) {
            Storage::disk('public')->delete($attachment->path);
        }

        $attachment->delete();

        return response()->noContent();
    }
}
