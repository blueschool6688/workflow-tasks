<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole(['super-admin', 'admin', 'workspace-admin'])) {
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
        if ($project->lead_id === $user->id) {
            return true;
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['super-admin', 'workspace-admin', 'project-manager']);
    }

    public function update(User $user, Project $project): bool
    {
        if ($project->lead_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->whereIn('role_in_project', ['lead', 'manager'])
            ->exists();
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasRole(['super-admin', 'workspace-admin']) || $project->lead_id === $user->id;
    }

    public function restore(User $user, Project $project): bool
    {
        return $user->hasRole(['super-admin', 'workspace-admin']);
    }

    public function forceDelete(User $user, Project $project): bool
    {
        return $user->hasRole(['super-admin', 'workspace-admin']);
    }
}
