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
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * User bisa melihat tugas jika dia pembuatnya ATAU terdaftar sebagai kolaborator.
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
     * User bisa mengupdate jika dia pembuatnya ATAU kolaborator dengan izin 'edit'.
     */
    public function update(User $user, Task $task): bool
    {
        // Cek apakah user adalah kolaborator dengan izin 'edit'
        $isEditor = $task->collaborators()
                         ->where('users.id', $user->id)
                         ->wherePivot('permission', 'edit')
                         ->exists();

        return $user->id === $task->user_id || $isEditor;
    }

    /**
     * Determine whether the user can delete the model.
     * Hanya pembuat asli yang bisa menghapus tugas.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }
}
