<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Organization $organization): bool
    {
        return $user->workspaces()->where('workspaces.organization_id', $organization->id)->exists();
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Organization $organization): bool
    {
        return false;
    }

    public function delete(User $user, Organization $organization): bool
    {
        return false;
    }
}
