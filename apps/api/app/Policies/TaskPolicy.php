<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $user->role === 'admin'
            || $task->project->members->contains('id', $user->id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        return $user->role === 'admin'
            || $task->assignee_id === $user->id
            || $task->reporter_id === $user->id
            || $task->project->lead_id === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->role === 'admin'
            || $task->reporter_id === $user->id
            || $task->project->lead_id === $user->id;
    }
}
