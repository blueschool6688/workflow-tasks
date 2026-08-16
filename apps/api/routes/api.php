<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EpicController;
use App\Http\Controllers\Api\V1\LabelController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\SprintController;
use App\Http\Controllers\Api\V1\TaskCommentController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\TaskWorkLogController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WorkflowController;
use App\Http\Controllers\Api\V1\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
*/

// --- Public ---
Route::post('/auth/login', [AuthController::class, 'login']);

// --- Authenticated ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/my-work', [DashboardController::class, 'myWork']);
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/calendar', [DashboardController::class, 'calendar']);
    });

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Organizations
    Route::apiResource('organizations', OrganizationController::class);

    // Workspaces
    Route::apiResource('workspaces', WorkspaceController::class);
    Route::post('/workspaces/{workspace}/members', [WorkspaceController::class, 'addMember']);
    Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'removeMember']);

    // Workspace → Labels
    Route::get('/workspaces/{workspace}/labels', [LabelController::class, 'index']);
    Route::post('/workspaces/{workspace}/labels', [LabelController::class, 'store']);
    Route::patch('/workspaces/{workspace}/labels/{label}', [LabelController::class, 'update']);
    Route::delete('/workspaces/{workspace}/labels/{label}', [LabelController::class, 'destroy']);

    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/summary', [DashboardController::class, 'projectSummary']);
    Route::get('/projects/{project}/board', [TaskController::class, 'board']);
    Route::get('/projects/{project}/worklogs', [TaskWorkLogController::class, 'projectLogs']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

    // Project → Sprints
    Route::get('/projects/{project}/sprints', [SprintController::class, 'index']);
    Route::post('/projects/{project}/sprints', [SprintController::class, 'store']);
    Route::get('/projects/{project}/sprints/{sprint}', [SprintController::class, 'show']);
    Route::patch('/projects/{project}/sprints/{sprint}', [SprintController::class, 'update']);
    Route::delete('/projects/{project}/sprints/{sprint}', [SprintController::class, 'destroy']);
    Route::post('/projects/{project}/sprints/{sprint}/start', [SprintController::class, 'start']);
    Route::post('/projects/{project}/sprints/{sprint}/complete', [SprintController::class, 'complete']);

    // Project → Epics
    Route::get('/projects/{project}/epics', [EpicController::class, 'index']);
    Route::post('/projects/{project}/epics', [EpicController::class, 'store']);
    Route::get('/projects/{project}/epics/{epic}', [EpicController::class, 'show']);
    Route::patch('/projects/{project}/epics/{epic}', [EpicController::class, 'update']);
    Route::delete('/projects/{project}/epics/{epic}', [EpicController::class, 'destroy']);

    // Project → Tasks
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);

    // Tasks (global + detail)
    Route::get('/tasks', [TaskController::class, 'myTasks']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::patch('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::patch('/tasks/{task}/order', [TaskController::class, 'reorder']);
    Route::get('/tasks/{task}/subtasks', [TaskController::class, 'subtasks']);

    // Task → Comments
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::patch('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

    // Task → Work Logs
    Route::get('/tasks/{task}/worklogs', [TaskWorkLogController::class, 'index']);
    Route::post('/tasks/{task}/worklogs', [TaskWorkLogController::class, 'store']);
    Route::patch('/tasks/{task}/worklogs/{worklog}', [TaskWorkLogController::class, 'update']);
    Route::delete('/tasks/{task}/worklogs/{worklog}', [TaskWorkLogController::class, 'destroy']);

    // Task → Attachments
    Route::post('/tasks/{task}/attachments', [MediaController::class, 'attachToTask']);
    Route::delete('/tasks/{task}/attachments/{attachment}', [MediaController::class, 'detachFromTask']);

    // Task → Activity
    Route::get('/tasks/{task}/activity', [ActivityLogController::class, 'forTask']);

    // Project → Activity
    Route::get('/projects/{project}/activity', [ActivityLogController::class, 'forProject']);

    // Workflows
    Route::get('/workflows', [WorkflowController::class, 'index']);
    Route::get('/workflows/{workflow}', [WorkflowController::class, 'show']);
    Route::post('/workflows', [WorkflowController::class, 'store']);
    Route::patch('/workflows/{workflow}', [WorkflowController::class, 'update']);
    Route::delete('/workflows/{workflow}', [WorkflowController::class, 'destroy']);
    Route::post('/workflows/{workflow}/statuses', [WorkflowController::class, 'storeStatus']);
    Route::patch('/workflows/{workflow}/statuses/{status}', [WorkflowController::class, 'updateStatus']);
    Route::delete('/workflows/{workflow}/statuses/{status}', [WorkflowController::class, 'destroyStatus']);

    // Media
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::get('/media/{media}', [MediaController::class, 'show']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);

    // Activity Logs (admin)
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});
