<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TaskWorkLogResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskWorkLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class TaskWorkLogController extends Controller
{
    public function projectLogs(Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $taskIds = $project->tasks()->pluck('id');
        $logs = TaskWorkLog::whereIn('task_id', $taskIds)
            ->with(['task', 'user'])
            ->latest('logged_at')
            ->get();

        return TaskWorkLogResource::collection($logs);
    }

    public function index(Task $task): AnonymousResourceCollection
    {
        $this->authorize('view', $task);

        $logs = $task->workLogs()->with('user')->latest('logged_at')->get();

        return TaskWorkLogResource::collection($logs);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'minutes_logged' => 'required|integer|min:1',
            'logged_at'      => 'nullable|date',
            'description'    => 'nullable|string|max:1000',
        ]);

        $log = DB::transaction(function () use ($task, $validated, $request) {
            $task->increment('time_spent_minutes', $validated['minutes_logged']);

            return $task->workLogs()->create([
                'user_id'        => $request->user()->id,
                'action'         => 'log',
                'minutes_logged' => $validated['minutes_logged'],
                'note'           => $validated['description'] ?? null,
                'logged_at'      => $validated['logged_at'] ?? now(),
            ]);
        });

        activity('task_workflow')
            ->performedOn($task)
            ->causedBy($request->user())
            ->withProperties(['minutes_logged' => $validated['minutes_logged']])
            ->log("Đã ghi nhận {$validated['minutes_logged']} phút làm việc");

        return response()->json(['data' => new TaskWorkLogResource($log->load('user'))], 201);
    }

    public function update(Request $request, Task $task, TaskWorkLog $worklog): JsonResponse
    {
        abort_unless($worklog->user_id === $request->user()->id, 403);

        $oldMinutes = $worklog->minutes_logged;

        $validated = $request->validate([
            'minutes_logged' => 'sometimes|required|integer|min:1',
            'description'    => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($worklog, $validated, $task, $oldMinutes) {
            $worklog->update(array_filter([
                'minutes_logged' => $validated['minutes_logged'] ?? null,
                'note'           => $validated['description'] ?? null,
            ], fn ($v) => $v !== null));

            if (isset($validated['minutes_logged'])) {
                $task->increment('time_spent_minutes', $validated['minutes_logged'] - $oldMinutes);
            }
        });

        return response()->json(['data' => new TaskWorkLogResource($worklog->fresh()->load('user'))]);
    }

    public function destroy(Request $request, Task $task, TaskWorkLog $worklog): JsonResponse
    {
        abort_unless($worklog->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        DB::transaction(function () use ($task, $worklog) {
            $task->decrement('time_spent_minutes', $worklog->minutes_logged);
            $worklog->delete();
        });

        return response()->json(['message' => 'Work log đã bị xóa']);
    }
}
