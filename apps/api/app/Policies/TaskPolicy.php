<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $user->canAccessProject($task->project);
    }

    public function update(User $user, Task $task): bool
    {
        return $user->canAccessProject($task->project);
    }

    public function delete(User $user, Task $task): bool
    {
        return $task->reporter_id === $user->id || $task->project->lead_id === $user->id;
    }
}
