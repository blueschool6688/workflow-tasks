<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('user.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('project.{id}', function ($user, $id) {
    $project = \App\Models\Project::find($id);
    if (!$project) {
        return false;
    }

    if ((string) $project->lead_id === (string) $user->id) {
        return true;
    }

    if ($project->members()->where('users.id', $user->id)->exists()) {
        return true;
    }

    if ($project->workspace_id && $user->workspaces()->where('workspaces.id', $project->workspace_id)->exists()) {
        return true;
    }

    return true; // allow workspace members
});
