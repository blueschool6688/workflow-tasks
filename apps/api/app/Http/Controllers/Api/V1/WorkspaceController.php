<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\WorkspaceResource;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkspaceController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $workspaces = $user->role === 'admin'
            ? Workspace::query()->paginate($request->perPage())
            : $user->workspaces()->paginate($request->perPage());

        return WorkspaceResource::collection($workspaces);
    }

    public function show(Workspace $workspace): WorkspaceResource
    {
        $this->authorize('view', $workspace);

        return new WorkspaceResource($workspace);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Workspace::class);

        $validated = $request->validate([
            'organization_id' => 'required|uuid|exists:organizations,id',
            'name'            => 'required|string|max:255',
            'slug'            => 'required|string|unique:workspaces,slug',
            'description'     => 'nullable|string',
        ]);

        $workspace = Workspace::create($validated);

        return response()->json(['data' => new WorkspaceResource($workspace)], 201);
    }

    public function update(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
        ]);

        $workspace->update($validated);

        return response()->json(['data' => new WorkspaceResource($workspace->fresh())]);
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);

        $workspace->delete();

        return response()->json(['message' => 'Workspace đã bị xóa']);
    }

    public function addMember(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'role'    => 'required|in:admin,member,viewer',
        ]);

        $workspace->members()->syncWithoutDetaching([
            $request->input('user_id') => ['role' => $request->input('role')],
        ]);

        return response()->json(['message' => 'Thành viên đã được thêm vào workspace']);
    }

    public function removeMember(Workspace $workspace, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        $workspace->members()->detach($user->id);

        return response()->json(['message' => 'Thành viên đã bị xóa khỏi workspace']);
    }
}
