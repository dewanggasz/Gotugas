<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Perform pre-authorization checks.
     * Jika user adalah admin, berikan akses penuh.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     * Semua user bisa melihat daftar tugas (controller akan memfilternya).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * User bisa melihat tugas jika dia pembuatnya ATAU jika ditugaskan kepadanya.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->id === $task->user_id || $user->id === $task->assigned_to_id;
    }

    /**
     * Determine whether the user can create models.
     * Semua user bisa membuat tugas.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Hanya pembuat yang bisa mengupdate.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     * Hanya pembuat yang bisa menghapus.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }
}
