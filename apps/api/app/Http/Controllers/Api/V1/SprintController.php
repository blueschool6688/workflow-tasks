<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SprintResource;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SprintController extends Controller
{
    public function index(Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $sprints = $project->sprints()->orderBy('created_at', 'desc')->get();

        return SprintResource::collection($sprints);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'goal'       => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $sprint = $project->sprints()->create(array_merge($validated, ['status' => 'planned']));

        return response()->json(['data' => new SprintResource($sprint)], 201);
    }

    public function show(Project $project, Sprint $sprint): SprintResource
    {
        $this->authorize('view', $project);

        return new SprintResource($sprint);
    }

    public function update(Request $request, Project $project, Sprint $sprint): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'goal'       => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
        ]);

        $sprint->update($validated);

        return response()->json(['data' => new SprintResource($sprint->fresh())]);
    }

    public function destroy(Project $project, Sprint $sprint): JsonResponse
    {
        $this->authorize('update', $project);

        $sprint->delete();

        return response()->json(['message' => 'Sprint đã bị xóa']);
    }

    public function start(Project $project, Sprint $sprint): JsonResponse
    {
        $this->authorize('update', $project);

        $sprint->update(['status' => 'active']);

        return response()->json(['data' => new SprintResource($sprint->fresh())]);
    }

    public function complete(Project $project, Sprint $sprint): JsonResponse
    {
        $this->authorize('update', $project);

        $sprint->update(['status' => 'completed']);

        return response()->json(['data' => new SprintResource($sprint->fresh())]);
    }
}
