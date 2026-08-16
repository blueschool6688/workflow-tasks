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

class ProjectController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $projects = Project::query()
            ->when($user->role !== 'admin', fn ($q) => $q->whereHas('members', fn ($m) => $m->where('users.id', $user->id)))
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
            'workspace_id'    => 'required|uuid|exists:workspaces,id',
            'name'            => 'required|string|max:255',
            'key'             => 'required|string|max:10|unique:projects,key',
            'description'     => 'nullable|string',
            'type'            => 'required|in:scrum,kanban,waterfall',
            'workflow_id'     => 'nullable|uuid|exists:workflows,id',
            'lead_id'         => 'nullable|uuid|exists:users,id',
            'start_date'      => 'nullable|date',
            'target_end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

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
            'lead_id'         => 'nullable|uuid|exists:users,id',
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

    public function addMember(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $request->validate([
            'user_id'         => 'required|uuid|exists:users,id',
            'role_in_project' => 'required|in:lead,developer,viewer',
        ]);

        $project->members()->syncWithoutDetaching([
            $request->input('user_id') => ['role_in_project' => $request->input('role_in_project')],
        ]);

        return response()->json(['message' => 'Thành viên đã được thêm vào dự án']);
    }

    public function removeMember(Project $project, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $project->members()->detach($user->id);

        return response()->json(['message' => 'Thành viên đã bị xóa khỏi dự án']);
    }
}
