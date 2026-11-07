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

Broadcast::routes(['middleware' => ['api', 'auth:api']]);
Broadcast::routes(['middleware' => ['api', 'auth:api'], 'prefix' => 'api/v1']);

Broadcast::channel('user.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('project.{id}', function ($user, $id) {
    $project = (new \App\Models\Project)->resolveRouteBinding($id);

    return $project && $user->canAccessProject($project);
});
