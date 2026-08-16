<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $user->role === 'admin'
            || $project->members->contains('id', $user->id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $user->role === 'admin'
            || $project->lead_id === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->role === 'admin';
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $user->role === 'admin'
            || $project->lead_id === $user->id;
    }
}
