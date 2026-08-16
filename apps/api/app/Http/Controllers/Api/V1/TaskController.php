<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    /** My tasks — for dashboard "My Work" section */
    public function myTasks(PaginationRequest $request): AnonymousResourceCollection
    {
        $tasks = Task::query()
            ->where('assignee_id', $request->user()->id)
            ->with(['status', 'project', 'assignee'])
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return TaskResource::collection($tasks);
    }

    /** Tasks scoped to a project — feeds Kanban / Backlog / Gantt */
    public function index(PaginationRequest $request, Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $tasks = Task::query()
            ->where('project_id', $project->id)
            ->with(['status', 'assignee', 'reporter', 'epic', 'sprint'])
            ->when($request->input('sprint_id'), function ($q, $v) use ($project) {
                if ($v === 'backlog' || $v === 'none') {
                    return $q->whereNull('sprint_id');
                }
                if (\Illuminate\Support\Str::isUuid($v)) {
                    return $q->where('sprint_id', $v);
                }
                $lower = strtolower($v);
                $sprint = \App\Models\Sprint::where('project_id', $project->id)
                    ->where(function ($sq) use ($lower, $v) {
                        $sq->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
                           ->orWhereRaw('LOWER(name) LIKE ?', ['%' . str_replace('-', ' ', $lower) . '%']);
                    })
                    ->first();
                if ($sprint) {
                    return $q->where('sprint_id', $sprint->id);
                }
                return $q->whereRaw('1 = 0');
            })
            ->when($request->input('epic_id'), fn ($q, $v) => $q->where('epic_id', $v))
            ->when($request->input('assignee_id'), fn ($q, $v) => $q->where('assignee_id', $v))
            ->when($request->input('status_id'), fn ($q, $v) => $q->where('status_id', $v))
            ->when($request->input('priority'), fn ($q, $v) => $q->where('priority', $v))
            ->when($request->input('parent_task_id') === 'null', fn ($q) => $q->whereNull('parent_task_id'))
            ->orderBy('order', 'asc')
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return TaskResource::collection($tasks);
    }

    /** Kanban Board columns with tasks grouped by status */
    public function board(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $workflow = $project->workflow ?? \App\Models\Workflow::where('is_default', true)->first();
        $statuses = $workflow ? $workflow->statuses()->orderBy('order')->get() : collect();

        if ($statuses->isEmpty()) {
            $statuses = \App\Models\WorkflowStatus::orderBy('order')->get();
        }

        $sprintId = $request->input('sprint_id');

        $tasks = $project->tasks()
            ->when($sprintId, function ($query, $sprintId) use ($project) {
                if ($sprintId === 'backlog' || $sprintId === 'none') {
                    return $query->whereNull('sprint_id');
                }
                if (\Illuminate\Support\Str::isUuid($sprintId)) {
                    return $query->where('sprint_id', $sprintId);
                }
                $lower = strtolower($sprintId);
                $sprint = \App\Models\Sprint::where('project_id', $project->id)
                    ->where(function ($sq) use ($lower) {
                        $sq->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
                           ->orWhereRaw('LOWER(name) LIKE ?', ['%' . str_replace('-', ' ', $lower) . '%']);
                    })
                    ->first();
                if ($sprint) {
                    return $query->where('sprint_id', $sprint->id);
                }
                return $query->whereRaw('1 = 0');
            })
            ->with(['status', 'assignee', 'reporter'])
            ->orderBy('order')
            ->get();

        $columns = $statuses->map(function ($status) use ($tasks) {
            $colTasks = $tasks->where('status_id', $status->id)->values();

            return [
                'id'       => $status->id,
                'title'    => $status->name,
                'category' => $status->category,
                'color'    => $status->color,
                'tasks'    => TaskResource::collection($colTasks),
            ];
        });

        return response()->json(['data' => $columns]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', Task::class);

        $validated = $request->validate([
            'title'            => 'required|string|max:500',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|in:story,task,bug,subtask',
            'status_id'        => 'nullable|uuid|exists:workflow_statuses,id',
            'priority'         => 'sometimes|in:critical,high,medium,low,none',
            'assignee_id'      => 'nullable|exists:users,id',
            'sprint_id'        => 'nullable|uuid|exists:sprints,id',
            'epic_id'          => 'nullable|uuid|exists:epics,id',
            'parent_task_id'   => 'nullable|uuid|exists:tasks,id',
            'due_date'         => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'labels'           => 'nullable|array',
        ]);

        if (empty($validated['type'])) {
            $validated['type'] = 'task';
        }

        if (empty($validated['priority'])) {
            $validated['priority'] = 'medium';
        }

        if (empty($validated['status_id'])) {
            $workflow = $project->workflow ?? \App\Models\Workflow::where('is_default', true)->first();
            $firstStatus = $workflow ? $workflow->statuses()->orderBy('order')->first() : \App\Models\WorkflowStatus::orderBy('order')->first();
            $validated['status_id'] = $firstStatus?->id;
        }

        $lastOrder = Task::where('project_id', $project->id)
            ->where('status_id', $validated['status_id'])
            ->max('order') ?? 0;

        $task = $project->tasks()->create(array_merge($validated, [
            'reporter_id'  => $request->user()->id,
            'order'        => $lastOrder + 1,
            'task_number'  => $this->nextTaskNumber($project),
        ]));

        return response()->json(['data' => new TaskResource($task->load(['status', 'assignee', 'reporter']))], 201);
    }

    public function show(Task $task): TaskResource
    {
        $this->authorize('view', $task);

        return new TaskResource($task->load(['status', 'assignee', 'reporter', 'epic', 'sprint', 'subtasks']));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title'            => 'sometimes|required|string|max:500',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|in:story,task,bug,subtask',
            'status_id'        => 'sometimes|uuid|exists:workflow_statuses,id',
            'priority'         => 'sometimes|in:critical,high,medium,low,none',
            'assignee_id'      => 'nullable|exists:users,id',
            'sprint_id'        => 'nullable',
            'epic_id'          => 'nullable|uuid|exists:epics,id',
            'parent_task_id'   => 'nullable|uuid|exists:tasks,id',
            'due_date'         => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'labels'           => 'nullable|array',
        ]);

        $oldStatusId = $task->status_id;
        $oldStatusName = $task->status?->name ?? 'To Do';
        $oldValues = $task->only(array_keys($validated));
        $task->update($validated);

        if (isset($validated['status_id']) && (string) $validated['status_id'] !== (string) $oldStatusId) {
            $newStatusName = $task->fresh()->status?->name ?? 'Mới';
            app(\App\Services\NotificationService::class)->notifyTaskStatusChanged(
                $task->fresh(),
                $oldStatusName,
                $newStatusName,
                $request->user()
            );
        }

        activity('task_workflow')
            ->performedOn($task)
            ->causedBy($request->user())
            ->withProperties(['old' => $oldValues, 'attributes' => $task->only(array_keys($validated))])
            ->log('Đã cập nhật thông tin nhiệm vụ');

        return response()->json(['data' => new TaskResource($task->fresh()->load(['status', 'assignee', 'reporter', 'sprint', 'epic']))]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        activity('task_workflow')
            ->performedOn($task)
            ->causedBy(request()->user())
            ->log('Đã xóa nhiệm vụ');

        $task->delete();

        return response()->json(['message' => 'Task đã bị xóa']);
    }

    /** Quick status change — used by Kanban drag-and-drop */
    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'status_id' => 'required|uuid|exists:workflow_statuses,id',
        ]);

        $oldStatusName = $task->status?->name ?? 'To Do';
        $task->update(['status_id' => $request->input('status_id')]);
        $newStatusName = $task->fresh()->status?->name ?? 'Mới';

        activity('task_workflow')
            ->performedOn($task)
            ->causedBy($request->user())
            ->withProperties(['old_status' => $oldStatusName, 'new_status' => $newStatusName])
            ->log("Đã chuyển trạng thái từ '{$oldStatusName}' sang '{$newStatusName}'");

        if ($oldStatusName !== $newStatusName) {
            app(\App\Services\NotificationService::class)->notifyTaskStatusChanged(
                $task->fresh(),
                $oldStatusName,
                $newStatusName,
                $request->user()
            );
        }

        return response()->json(['data' => new TaskResource($task->fresh()->load('status'))]);
    }

    /** Batch reorder within a status column */
    public function reorder(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'order'     => 'required|integer|min:1',
            'status_id' => 'sometimes|uuid|exists:workflow_statuses,id',
        ]);

        $task->update($request->only(['order', 'status_id']));

        return response()->json(['data' => new TaskResource($task->fresh()->load('status'))]);
    }

    public function subtasks(Task $task): AnonymousResourceCollection
    {
        $this->authorize('view', $task);

        return TaskResource::collection($task->subtasks()->with(['status', 'assignee'])->get());
    }

    private function nextTaskNumber(Project $project): string
    {
        $max = Task::where('project_id', $project->id)->max('task_number');
        $next = $max ? ((int) substr($max, strlen($project->key) + 1)) + 1 : 1;

        return $project->key . '-' . $next;
    }
}
