<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        // Muat relasi untuk efisiensi query
        $query = Task::with(['user', 'assignee']);

        if (!$user->isAdmin()) {
            // Tampilkan tugas yang dibuat oleh user ATAU ditugaskan kepada user
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('assigned_to_id', $user->id);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $sortBy = $request->input('sort_by', 'newest');
        match ($sortBy) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'due_date_asc' => $query->orderBy('due_date', 'asc'),
            'due_date_desc' => $query->orderBy('due_date', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $perPage = $request->input('per_page', 10);
        return TaskResource::collection($query->paginate($perPage));
    }

    /**
     * Get a summary of tasks.
     */
    public function summary(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Query dasar untuk tugas milik pengguna (atau semua tugas jika admin)
        $tasksQuery = Task::query();
        if (!$user->isAdmin()) {
            $tasksQuery->where('user_id', $user->id);
        }

        // Hitung statistik
        $createdThisMonth = (clone $tasksQuery)
            ->whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        $completedThisMonth = (clone $tasksQuery)
            ->where('status', 'completed')
            ->whereYear('updated_at', Carbon::now()->year)
            ->whereMonth('updated_at', Carbon::now()->month)
            ->count();

        $inProgress = (clone $tasksQuery)->where('status', 'in_progress')->count();

        $cancelled = (clone $tasksQuery)->where('status', 'cancelled')->count();

        $overdue = (clone $tasksQuery)
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', Carbon::now())
            ->count();

        return response()->json([
            'created_this_month' => $createdThisMonth,
            'completed_this_month' => $completedThisMonth,
            'in_progress' => $inProgress,
            'cancelled' => $cancelled,
            'overdue' => $overdue,
        ]);
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
            'assigned_to_id' => 'nullable|exists:users,id', // Validasi input baru
        ]);
        
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $task = $user->tasks()->create($validated);

        return new TaskResource($task->load(['user', 'assignee']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return new TaskResource($task->load(['user', 'assignee']));
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
            'assigned_to_id' => 'nullable|sometimes|exists:users,id', // Validasi input baru
        ]);

        $task->update($validated);

        return new TaskResource($task->load(['user', 'assignee']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->noContent();
    }
}
