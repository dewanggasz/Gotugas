<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Http\Resources\Api\V1\TaskActivityResource;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\SendTaskAssignedNotification;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Builder;

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
        $query = Task::with(['user', 'collaborators', 'attachments']);

        $selectedUserId = $request->input('user_id');

        if ($user->role === 'semi_admin') {
            // Semi Admin melihat tugasnya sendiri, atau tugas yang dibuat oleh employee/semi_admin lain
            $query->where(function (Builder $q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('collaborators', fn(Builder $subQ) => $subQ->where('users.id', $user->id))
                  ->orWhereHas('user', fn(Builder $subQ) => $subQ->whereIn('role', ['employee', 'semi_admin']));
            });
        } elseif ($user->role === 'employee') {
            // Employee hanya melihat tugas yang terkait dengannya
            $query->where(function (Builder $q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('collaborators', fn(Builder $subQ) => $subQ->where('users.id', $user->id));
            });
        }
        // Jika peran adalah 'admin', tidak perlu filter awal karena mereka bisa melihat semua.

        // Langkah 2: Terapkan filter pengguna jika ada (hanya untuk admin dan semi_admin)
        if ($user->hasAdminPrivileges() && $selectedUserId && $selectedUserId !== 'all') {
            $query->where(function (Builder $q) use ($selectedUserId) {
                $q->where('user_id', $selectedUserId)
                  ->orWhereHas('collaborators', fn(Builder $subQ) => $subQ->where('users.id', $selectedUserId));
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

        $tasksQuery = Task::query();
        if (!$user->isAdmin()) {
            $tasksQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('collaborators', function ($subQ) use ($user) {
                      $subQ->where('users.id', $user->id);
                  });
            });
        }

        $createdThisMonth = (clone $tasksQuery)->whereYear('created_at', Carbon::now()->year)->whereMonth('created_at', Carbon::now()->month)->count();
        $completedThisMonth = (clone $tasksQuery)->where('status', 'completed')->whereYear('updated_at', Carbon::now()->year)->whereMonth('updated_at', Carbon::now()->month)->count();
        $inProgress = (clone $tasksQuery)->where('status', 'in_progress')->count();
        $cancelled = (clone $tasksQuery)->where('status', 'cancelled')->count();
        $overdue = (clone $tasksQuery)->where('status', '!=', 'completed')->whereNotNull('due_date')->whereDate('due_date', '<', Carbon::now())->count();

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
            'collaborators' => 'present|array',
            'collaborators.*.user_id' => 'required|exists:users,id',
            'collaborators.*.permission' => ['required', Rule::in(['edit', 'view', 'comment'])],
        ]);
        
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $task = $user->createdTasks()->create($validated);

        $collaboratorsData = collect($validated['collaborators'])->keyBy('user_id');
        $collaboratorsData[$user->id] = ['user_id' => $user->id, 'permission' => 'edit'];
        $syncData = $collaboratorsData->mapWithKeys(fn($item) => [$item['user_id'] => ['permission' => $item['permission']]])->all();
        
        // Simpan kolaborator
        $task->collaborators()->sync($syncData);

        // --- 2. Panggil Job SETELAH kolaborator disimpan ---
        // Kita kirim seluruh model $task ke dalam Job
        SendTaskAssignedNotification::dispatch($task->id);

        return new TaskResource($task->load(['user', 'collaborators', 'attachments']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return new TaskResource($task->load(['user', 'collaborators', 'attachments']));
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
            'collaborators' => 'sometimes|present|array',
            'collaborators.*.user_id' => 'required|exists:users,id',
            'collaborators.*.permission' => ['required', Rule::in(['edit', 'view', 'comment'])],
            'update_message' => 'nullable|string|max:1000',
        ]);

        $task->update($validated);

        if ($request->has('collaborators')) {
            $user = $task->user;
            $collaboratorsData = collect($validated['collaborators'])->keyBy('user_id');
            $collaboratorsData[$user->id] = ['user_id' => $user->id, 'permission' => 'edit'];
            $syncData = $collaboratorsData->mapWithKeys(fn($item) => [$item['user_id'] => ['permission' => $item['permission']]])->all();
            
            // --- PERUBAHAN DI SINI ---
            // Tangkap hasil dari sync untuk mengetahui siapa yang baru ditambahkan
            $syncResult = $task->collaborators()->sync($syncData);

            // Ambil ID kolaborator yang baru ditambahkan
            $newlyAddedIds = $syncResult['attached'];

            // Jika ada kolaborator baru, panggil Job hanya untuk mereka
            if (!empty($newlyAddedIds)) {
                SendTaskAssignedNotification::dispatch($task->id, $newlyAddedIds);
            }
        }

        if ($request->filled('update_message')) {
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => Auth::id(),
                'description' => "memberikan pembaruan: \"{$request->update_message}\"",
            ]);
        }

        return new TaskResource($task->load(['user', 'collaborators', 'attachments']));
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

    /**
     * Display a listing of the task's activities.
     */
    public function activities(Task $task)
    {
        $this->authorize('view', $task);
        $activities = $task->activities()->with('user')->paginate(15);
        return TaskActivityResource::collection($activities);
    }
    
    /**
     * Handle posting a text update to a task.
     */
    public function postUpdate(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $task->activities()->create([
            'user_id' => Auth::id(),
            'description' => "memberikan pembaruan: \"{$validated['message']}\"",
        ]);

        return response()->json(['message' => 'Pembaruan berhasil diposting.'], 201);
    }
}
