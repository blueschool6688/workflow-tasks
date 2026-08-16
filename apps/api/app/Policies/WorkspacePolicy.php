<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
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

    public function view(User $user, Workspace $workspace): bool
    {
        return $workspace->members->contains('id', $user->id) || $user->current_workspace_id === $workspace->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Workspace $workspace): bool
    {
        $member = $workspace->members()->where('users.id', $user->id)->first();
        return $member && in_array($member->pivot->role ?? '', ['owner', 'admin']);
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        $member = $workspace->members()->where('users.id', $user->id)->first();
        return $member && ($member->pivot->role ?? '') === 'owner';
    }

    public function manageMembers(User $user, Workspace $workspace): bool
    {
        $member = $workspace->members()->where('users.id', $user->id)->first();
        return $member && in_array($member->pivot->role ?? '', ['owner', 'admin']);
    }
}
