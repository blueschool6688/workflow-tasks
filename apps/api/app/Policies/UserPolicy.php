<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $authUser, User $targetUser): bool
    {
        return $authUser->role === 'admin' || $authUser->id === $targetUser->id;
    }

    public function delete(User $authUser, User $targetUser): bool
    {
        return $authUser->role === 'admin' && $authUser->id !== $targetUser->id;
    }
}
