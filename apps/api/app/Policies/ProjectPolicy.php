<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $user->canAccessProject($project);
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

    public function manageWorkflow(User $user, Project $project): bool
    {
        if ($project->lead_id === $user->id) {
            return true;
        }

        if ($project->workspace && $project->workspace->members()->where('users.id', $user->id)->whereIn('workspace_members.role', ['owner', 'admin'])->exists()) {
            return true;
        }

        return $project->members()->where('users.id', $user->id)->whereIn('project_members.role_in_project', ['lead', 'admin', 'manager'])->exists();
    }
}
