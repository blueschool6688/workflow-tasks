<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\ProjectResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $projects = Project::query()
            ->when(! $user->isAdmin(), fn ($q) => $q->accessibleBy($user))
            ->with('lead')
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return ProjectResource::collection($projects);
    }

    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        return new ProjectResource($project->load('lead'));
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'workspace_id'    => 'sometimes|required|uuid|exists:workspaces,id',
            'name'            => 'required|string|max:255',
            'key'             => 'required|string|max:10|unique:projects,key',
            'description'     => 'nullable|string',
            'type'            => 'required|in:scrum,kanban,freeform',
            'workflow_id'     => 'nullable|uuid|exists:workflows,id',
            'lead_id'         => 'nullable|exists:users,id',
            'start_date'      => 'nullable|date',
            'target_end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if (empty($validated['workspace_id'])) {
            $validated['workspace_id'] = $request->user()->current_workspace_id ?? \App\Models\Workspace::first()?->id;
        }

        $project = Project::create($validated);
        $project->members()->attach($request->user()->id, ['role_in_project' => 'lead']);

        return response()->json(['data' => new ProjectResource($project->load('lead'))], 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'description'     => 'nullable|string',
            'status'          => 'sometimes|in:active,completed,archived',
            'workflow_id'     => 'nullable|uuid|exists:workflows,id',
            'lead_id'         => 'nullable|exists:users,id',
            'start_date'      => 'nullable|date',
            'target_end_date' => 'nullable|date',
        ]);

        $project->update($validated);

        return response()->json(['data' => new ProjectResource($project->fresh()->load('lead'))]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(['message' => 'Dự án đã bị xóa']);
    }

    /** Members plus the workspace people who could be added; never exposes users outside the workspace. */
    public function members(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $members = $project->members()->orderBy('users.name')->get(['users.id', 'users.name', 'users.email', 'users.avatar']);

        $candidates = $request->user()->can('manageMembers', $project) && $project->workspace
            ? $project->workspace->members()
                ->whereNotIn('users.id', $members->pluck('id'))
                ->orderBy('users.name')
                ->get(['users.id', 'users.name', 'users.email'])
            : collect();

        return response()->json([
            'data' => $members->map(fn ($m) => [
                'id'              => $m->id,
                'name'            => $m->name,
                'email'           => $m->email,
                'avatar'          => $m->avatar,
                'role_in_project' => $m->pivot->role_in_project,
                'is_lead'         => $m->id === $project->lead_id,
            ]),
            'candidates'     => $candidates->map->only(['id', 'name', 'email'])->values(),
            'can_manage'     => $request->user()->can('manageMembers', $project),
        ]);
    }

    public function addMember(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $request->validate([
            'user_id'         => [
                'required',
                Rule::exists('workspace_members', 'user_id')->where('workspace_id', $project->workspace_id),
            ],
            'role_in_project' => 'required|in:lead,manager,developer,reporter,viewer',
        ], [
            'user_id.exists' => 'Người dùng phải thuộc workspace của dự án.',
        ]);

        $project->members()->syncWithoutDetaching([
            $request->input('user_id') => ['role_in_project' => $request->input('role_in_project')],
        ]);

        return response()->json(['message' => 'Thành viên đã được thêm vào dự án']);
    }

    public function removeMember(Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        abort_if($project->lead_id === $user->id, 422, 'Không thể xóa trưởng dự án. Hãy đổi trưởng dự án trước.');

        $project->members()->detach($user->id);

        return response()->json(['message' => 'Thành viên đã bị xóa khỏi dự án']);
    }
}
