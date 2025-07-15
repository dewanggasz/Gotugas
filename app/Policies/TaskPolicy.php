<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->id === $task->user_id || $task->collaborators()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        $isEditor = $task->collaborators()
                         ->where('users.id', $user->id)
                         ->wherePivot('permission', 'edit')
                         ->exists();

        return $user->id === $task->user_id || $isEditor;
    }

    /**
     * Determine whether the user can comment on the task.
     * Aturan baru untuk otorisasi komentar.
     */
    public function comment(User $user, Task $task): bool
    {
        // Cek apakah user adalah kolaborator dengan izin 'edit' atau 'comment'
        $isAllowedCollaborator = $task->collaborators()
                         ->where('users.id', $user->id)
                         ->whereIn('permission', ['edit', 'comment'])
                         ->exists();

        // User bisa berkomentar jika dia pembuat ATAU kolaborator yang diizinkan
        return $user->id === $task->user_id || $isAllowedCollaborator;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }
}
