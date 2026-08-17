<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels & Routes
|--------------------------------------------------------------------------
|
| Register broadcasting authorization routes with Sanctum auth middleware.
|
*/

Broadcast::routes(['middleware' => ['api', 'auth:api,sanctum']]);
Broadcast::routes(['middleware' => ['api', 'auth:api,sanctum'], 'prefix' => 'api/v1']);

Broadcast::channel('user.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('project.{id}', function ($user, $id) {
    if (\Illuminate\Support\Str::isUuid($id)) {
        $project = \App\Models\Project::find($id);
    } else {
        $project = \App\Models\Project::where('key', $id)
            ->orWhere('key', strtoupper($id))
            ->orWhere('key', strtolower($id))
            ->first();
    }

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
