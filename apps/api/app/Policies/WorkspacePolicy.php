<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Workspace $workspace): bool
    {
        return $user->role === 'admin'
            || $workspace->members->contains('id', $user->id);
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Workspace $workspace): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $user->role === 'admin';
    }

    public function manageMembers(User $user, Workspace $workspace): bool
    {
        return $user->role === 'admin';
    }
}
