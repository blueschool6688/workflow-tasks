<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(PaginationRequest $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $logs = Activity::query()
            ->with('causer', 'subject')
            ->when($request->input('log_name'), fn ($q, $v) => $q->where('log_name', $v))
            ->when($request->input('causer_id'), fn ($q, $v) => $q->where('causer_id', $v))
            ->orderBy('created_at', 'desc')
            ->paginate($request->perPage());

        return response()->json($logs);
    }

    public function forTask(Request $request, \App\Models\Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $logs = Activity::query()
            ->where('subject_type', \App\Models\Task::class)
            ->where('subject_id', $task->id)
            ->with('causer')
            ->latest()
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function forProject(Request $request, \App\Models\Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $logs = Activity::query()
            ->where('subject_type', \App\Models\Project::class)
            ->where('subject_id', $project->id)
            ->with('causer')
            ->latest()
            ->get();

        return response()->json(['data' => $logs]);
    }
}
