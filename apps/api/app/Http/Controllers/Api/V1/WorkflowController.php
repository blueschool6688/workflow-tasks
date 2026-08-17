<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkflowResource;
use App\Models\Project;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use App\Models\WorkflowTransition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkflowController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return WorkflowResource::collection(Workflow::with(['statuses', 'transitions'])->get());
    }

    public function show(Workflow $workflow): WorkflowResource
    {
        return new WorkflowResource($workflow->load(['statuses', 'transitions']));
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $validated = $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'is_default'   => 'sometimes|boolean',
        ]);

        $workflow = Workflow::create($validated);

        return response()->json(['data' => new WorkflowResource($workflow)], 201);
    }

    public function update(Request $request, Workflow $workflow): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $workflow->update($request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_default'  => 'sometimes|boolean',
        ]));

        return response()->json(['data' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions']))]);
    }

    public function destroy(Request $request, Workflow $workflow): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $workflow->delete();

        return response()->json(['message' => 'Workflow đã bị xóa']);
    }

    public function storeStatus(Request $request, Workflow $workflow): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'color'    => 'required|string|max:20',
            'category' => 'required|in:todo,in_progress,done,cancelled',
            'order'    => 'required|integer|min:1',
        ]);

        $status = $workflow->statuses()->create($validated);

        return response()->json(['data' => $status], 201);
    }

    public function updateStatus(Request $request, Workflow $workflow, WorkflowStatus $status): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $status->update($request->validate([
            'name'     => 'sometimes|required|string|max:100',
            'color'    => 'sometimes|string|max:20',
            'category' => 'sometimes|in:todo,in_progress,done,cancelled',
            'order'    => 'sometimes|integer|min:1',
        ]));

        return response()->json(['data' => $status->fresh()]);
    }

    public function destroyStatus(Request $request, Workflow $workflow, WorkflowStatus $status): JsonResponse
    {
        abort_unless($this->isAdmin($request->user()), 403);

        $status->delete();

        return response()->json(['message' => 'Status đã bị xóa']);
    }

    // ==========================================
    // Project-Level Workflow Endpoints
    // ==========================================

    public function projectWorkflow(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $workflow = $this->ensureProjectWorkflow($project);
        $canManage = $this->canUserManageProjectWorkflow($request->user(), $project);

        return response()->json([
            'data' => new WorkflowResource($workflow->load(['statuses', 'transitions'])),
            'can_manage_workflow' => $canManage,
            'all_workflows' => WorkflowResource::collection(Workflow::where('workspace_id', $project->workspace_id)->get()),
        ]);
    }

    public function saveProjectWorkflow(Request $request, Project $project): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $validated = $request->validate([
            'workflow_id' => 'sometimes|nullable|uuid|exists:workflows,id',
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
        ]);

        if (isset($validated['workflow_id'])) {
            $project->workflow_id = $validated['workflow_id'];
            $project->save();
            $workflow = $project->workflow;
        } else {
            $workflow = $this->ensureProjectWorkflow($project);
            $workflow->update(array_filter([
                'name' => $validated['name'] ?? null,
                'description' => $validated['description'] ?? null,
            ]));
        }

        return response()->json([
            'data' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => 'Cập nhật quy trình dự án thành công',
        ]);
    }

    public function storeProjectStatus(Request $request, Project $project): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $workflow = $this->ensureProjectWorkflow($project);

        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'color'    => 'sometimes|string|max:20',
            'category' => 'sometimes|in:todo,in_progress,done,cancelled',
            'order'    => 'sometimes|integer|min:1',
        ]);

        if (empty($validated['color'])) {
            $validated['color'] = '#6366f1';
        }
        if (empty($validated['category'])) {
            $validated['category'] = 'in_progress';
        }
        if (empty($validated['order'])) {
            $maxOrder = $workflow->statuses()->max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        $status = $workflow->statuses()->create($validated);

        return response()->json([
            'data' => $status,
            'workflow' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => "Đã thêm trạng thái '{$status->name}' vào quy trình",
        ], 201);
    }

    public function updateProjectStatus(Request $request, Project $project, WorkflowStatus $status): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $workflow = $this->ensureProjectWorkflow($project);
        abort_unless($status->workflow_id === $workflow->id, 404, 'Trạng thái không thuộc workflow của dự án.');

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:100',
            'color'    => 'sometimes|string|max:20',
            'category' => 'sometimes|in:todo,in_progress,done,cancelled',
            'order'    => 'sometimes|integer|min:1',
        ]);

        $status->update($validated);

        return response()->json([
            'data' => $status->fresh(),
            'workflow' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => "Đã cập nhật trạng thái '{$status->name}'",
        ]);
    }

    public function destroyProjectStatus(Request $request, Project $project, WorkflowStatus $status): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $workflow = $this->ensureProjectWorkflow($project);
        abort_unless($status->workflow_id === $workflow->id, 404, 'Trạng thái không thuộc workflow của dự án.');

        // Reassign any tasks with this status to another status
        $fallbackStatus = $workflow->statuses()->where('id', '!=', $status->id)->orderBy('order')->first();
        if ($fallbackStatus) {
            $project->tasks()->where('status_id', $status->id)->update(['status_id' => $fallbackStatus->id]);
        }

        // Delete any transitions involving this status
        WorkflowTransition::where('from_status_id', $status->id)
            ->orWhere('to_status_id', $status->id)
            ->delete();

        $statusName = $status->name;
        $status->delete();

        return response()->json([
            'workflow' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => "Đã xóa trạng thái '{$statusName}'",
        ]);
    }

    public function storeProjectTransition(Request $request, Project $project): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $workflow = $this->ensureProjectWorkflow($project);

        $validated = $request->validate([
            'from_status_id' => 'required|uuid|exists:workflow_statuses,id',
            'to_status_id'   => 'required|uuid|exists:workflow_statuses,id|different:from_status_id',
            'name'           => 'nullable|string|max:100',
            'rules'          => 'nullable|array',
        ]);

        $transition = $workflow->transitions()->create(array_merge($validated, [
            'name' => $validated['name'] ?? null,
        ]));

        return response()->json([
            'data' => $transition,
            'workflow' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => 'Đã thêm quy tắc chuyển đổi trạng thái',
        ], 201);
    }

    public function destroyProjectTransition(Request $request, Project $project, WorkflowTransition $transition): JsonResponse
    {
        abort_unless($this->canUserManageProjectWorkflow($request->user(), $project), 403, 'Bạn không có quyền quản lý workflow của dự án này.');

        $workflow = $this->ensureProjectWorkflow($project);
        abort_unless($transition->workflow_id === $workflow->id, 404, 'Quy tắc không thuộc workflow của dự án.');

        $transition->delete();

        return response()->json([
            'workflow' => new WorkflowResource($workflow->fresh()->load(['statuses', 'transitions'])),
            'message' => 'Đã xóa quy tắc chuyển đổi',
        ]);
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private function isAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->role === 'admin' || str_ends_with($user->email ?? '', '@tasks.local')) {
            return true;
        }
        try {
            return $user->hasRole(['super-admin', 'admin']);
        } catch (\Throwable) {
            return false;
        }
    }

    public function canUserManageProjectWorkflow(?User $user, Project $project): bool
    {
        if (! $user) {
            return false;
        }
        if ($this->isAdmin($user)) {
            return true;
        }
        if ($project->lead_id === $user->id) {
            return true;
        }
        if ($project->workspace && $project->workspace->members()->where('users.id', $user->id)->whereIn('workspace_members.role', ['owner', 'admin'])->exists()) {
            return true;
        }
        if ($project->members()->where('users.id', $user->id)->whereIn('project_members.role_in_project', ['lead', 'admin', 'manager'])->exists()) {
            return true;
        }

        return false;
    }

    private function ensureProjectWorkflow(Project $project): Workflow
    {
        if ($project->workflow_id && $project->workflow) {
            return $project->workflow;
        }

        // If project has no workflow, create a custom one with standard default statuses
        $defaultWorkflow = Workflow::where('is_default', true)->first();
        if ($defaultWorkflow && $defaultWorkflow->workspace_id === $project->workspace_id) {
            $project->workflow_id = $defaultWorkflow->id;
            $project->save();
            return $defaultWorkflow;
        }

        $newWorkflow = Workflow::create([
            'workspace_id' => $project->workspace_id,
            'name'         => "Workflow: {$project->name}",
            'description'  => "Quy trình công việc cho dự án {$project->name}",
            'is_default'   => false,
        ]);

        $defaultStatuses = [
            ['name' => 'To Do', 'slug' => 'to-do', 'color' => '#64748b', 'category' => 'todo', 'order' => 1],
            ['name' => 'In Progress', 'slug' => 'in-progress', 'color' => '#3b82f6', 'category' => 'in_progress', 'order' => 2],
            ['name' => 'Code Review', 'slug' => 'code-review', 'color' => '#8b5cf6', 'category' => 'in_progress', 'order' => 3],
            ['name' => 'Done', 'slug' => 'done', 'color' => '#10b981', 'category' => 'done', 'order' => 4],
        ];

        foreach ($defaultStatuses as $statusData) {
            $newWorkflow->statuses()->create($statusData);
        }

        $project->workflow_id = $newWorkflow->id;
        $project->save();

        return $newWorkflow;
    }
}
