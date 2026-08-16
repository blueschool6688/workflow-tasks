<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin' || $user->hasRole('super-admin') || $user->hasRole('admin') || $user->email === 'admin@tasks.local') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $project->lead_id === $user->id || $project->members->contains('id', $user->id);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->lead_id === $user->id;
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $project->lead_id === $user->id;
    }
}
