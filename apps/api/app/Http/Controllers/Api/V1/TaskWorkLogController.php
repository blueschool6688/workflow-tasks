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
        $this->authorize('view', $task);

        $validated = $request->validate([
            'minutes_logged' => 'required|integer|min:1',
            'logged_at'      => 'nullable|date',
            'description'    => 'nullable|string|max:1000',
        ]);

        $log = $task->workLogs()->create(array_merge($validated, [
            'user_id'   => $request->user()->id,
            'logged_at' => $validated['logged_at'] ?? now(),
        ]));

        $task->increment('time_spent_minutes', $validated['minutes_logged']);

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

        $worklog->update($validated);

        if (isset($validated['minutes_logged'])) {
            $diff = $validated['minutes_logged'] - $oldMinutes;
            $task->increment('time_spent_minutes', $diff);
        }

        return response()->json(['data' => new TaskWorkLogResource($worklog->fresh()->load('user'))]);
    }

    public function destroy(Request $request, Task $task, TaskWorkLog $worklog): JsonResponse
    {
        abort_unless($worklog->user_id === $request->user()->id || $request->user()->role === 'admin', 403);

        $task->decrement('time_spent_minutes', $worklog->minutes_logged);
        $worklog->delete();

        return response()->json(['message' => 'Work log đã bị xóa']);
    }
}
