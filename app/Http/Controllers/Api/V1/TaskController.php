<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */ // <-- Tambahkan ini
        $user = Auth::user();
        $query = Task::query();

        // Admin bisa melihat semua tugas, karyawan hanya tugasnya sendiri
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Logika filter berdasarkan bulan dan tahun
        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('created_at', $request->month)
                  ->whereYear('created_at', $request->year);
        }

        return TaskResource::collection($query->latest()->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Task::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['not_started', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => 'nullable|date',
        ]);

        /** @var \App\Models\User $user */ // <-- Tambahkan ini
        $user = Auth::user();
        $task = $user->tasks()->create($validated);

        return new TaskResource($task);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return new TaskResource($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['sometimes', 'required', Rule::in(['not_started', 'in_progress', 'completed', 'cancelled'])],
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->noContent(); // 204 No Content
    }
}
