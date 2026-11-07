<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\TaskResource;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
            ->when($request->input('sprint_id'), fn ($q, $v) => $this->filterBySprint($q, $v, $project))
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
            ->when($sprintId, fn ($q, $v) => $this->filterBySprint($q, $v, $project))
            ->with(['status', 'assignee', 'reporter'])
            ->orderBy('order')
            ->get();

        $canManageWorkflow = $request->user()->can('manageWorkflow', $project);

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

        return response()->json([
            'data' => $columns,
            'can_manage_workflow' => $canManageWorkflow,
            'workflow' => $workflow ? [
                'id' => $workflow->id,
                'name' => $workflow->name,
                'description' => $workflow->description,
                'statuses' => $workflow->statuses()->orderBy('order')->get(),
                'transitions' => $workflow->transitions()->get(),
            ] : null,
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $validated = $request->validate([
            'title'            => 'required|string|max:500',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|in:story,task,bug,subtask',
            'priority'         => 'sometimes|in:low,medium,high,urgent',
            'assignee_id'      => 'nullable|exists:users,id',
            'due_date'         => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'labels'           => 'nullable|array',
        ] + $this->projectScopedRules($project, 'nullable'));

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

        $task = DB::transaction(function () use ($project, $validated, $request) {
            // Lock the project row so concurrent creates get distinct task numbers.
            Project::whereKey($project->id)->lockForUpdate()->first();

            $lastOrder = Task::where('project_id', $project->id)
                ->where('status_id', $validated['status_id'])
                ->max('order') ?? 0;

            return $project->tasks()->create(array_merge($validated, [
                'reporter_id'  => $request->user()->id,
                'order'        => $lastOrder + 1,
                'task_number'  => $this->nextTaskNumber($project),
            ]));
        });

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
            'priority'         => 'sometimes|in:low,medium,high,urgent',
            'assignee_id'      => 'nullable|exists:users,id',
            'due_date'         => 'nullable|date',
            'estimate_minutes' => 'nullable|integer|min:0',
            'labels'           => 'nullable|array',
        ] + $this->projectScopedRules($task->project, 'sometimes'));

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
            'status_id' => ['required', 'uuid', $this->statusRule($task->project)],
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
            'status_id' => ['sometimes', 'uuid', $this->statusRule($task->project)],
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
        $prefix = $project->key . '-';
        // shortcut: loads every task number of the project; move to a counter column past ~50k tasks per project.
        $numbers = Task::where('project_id', $project->id)
            ->where('task_number', 'like', $prefix . '%')
            ->pluck('task_number')
            ->map(fn ($n) => (int) substr($n, strlen($prefix)));

        return $prefix . ($numbers->max() + 1);
    }

    private function filterBySprint($query, string $sprintId, Project $project)
    {
        if ($sprintId === 'backlog' || $sprintId === 'none') {
            return $query->whereNull('sprint_id');
        }
        if (Str::isUuid($sprintId)) {
            return $query->where('sprint_id', $sprintId);
        }

        $lower = strtolower($sprintId);
        $sprint = Sprint::where('project_id', $project->id)
            ->where(function ($sq) use ($lower) {
                $sq->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
                   ->orWhereRaw('LOWER(name) LIKE ?', ['%' . str_replace('-', ' ', $lower) . '%']);
            })
            ->first();

        return $sprint ? $query->where('sprint_id', $sprint->id) : $query->whereRaw('1 = 0');
    }

    private function statusRule(Project $project)
    {
        return $project->workflow_id
            ? Rule::exists('workflow_statuses', 'id')->where('workflow_id', $project->workflow_id)
            : Rule::exists('workflow_statuses', 'id');
    }

    private function projectScopedRules(Project $project, string $presence): array
    {
        return [
            'status_id'      => [$presence, 'nullable', 'uuid', $this->statusRule($project)],
            'sprint_id'      => ['nullable', 'uuid', Rule::exists('sprints', 'id')->where('project_id', $project->id)],
            'epic_id'        => ['nullable', 'uuid', Rule::exists('epics', 'id')->where('project_id', $project->id)],
            'parent_task_id' => ['nullable', 'uuid', Rule::exists('tasks', 'id')->where('project_id', $project->id)],
        ];
    }
}
