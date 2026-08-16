<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->hasRole('super-admin') || $user->hasRole('admin') || $user->email === 'admin@tasks.local';
    }

    public function view(User $user, User $model): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->hasRole('super-admin') || $user->hasRole('admin');
    }

    public function update(User $authUser, User $targetUser): bool
    {
        return $authUser->role === 'admin' || $authUser->hasRole('super-admin') || $authUser->hasRole('admin') || $authUser->id === $targetUser->id;
    }

    public function delete(User $authUser, User $targetUser): bool
    {
        return ($authUser->role === 'admin' || $authUser->hasRole('super-admin') || $authUser->hasRole('admin')) && $authUser->id !== $targetUser->id;
    }
}
