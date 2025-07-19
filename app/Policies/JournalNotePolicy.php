<?php

namespace App\Policies;

use App\Models\JournalNote;
use App\Models\User;

class JournalNotePolicy
{
    private function isOwner(User $user, JournalNote $note): bool
    {
        return $user->id === $note->journal->user_id;
    }

    public function update(User $user, JournalNote $note): bool
    {
        return $this->isOwner($user, $note);
    }

    public function delete(User $user, JournalNote $note): bool
    {
        return $this->isOwner($user, $note);
    }
}