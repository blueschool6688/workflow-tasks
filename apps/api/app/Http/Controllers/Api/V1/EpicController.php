<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\EpicResource;
use App\Models\Epic;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EpicController extends Controller
{
    public function index(Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        return EpicResource::collection($project->epics()->get());
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
        ]);

        $epic = $project->epics()->create(array_merge($validated, ['status' => 'open']));

        return response()->json(['data' => new EpicResource($epic)], 201);
    }

    public function show(Project $project, Epic $epic): EpicResource
    {
        $this->authorize('view', $project);

        return new EpicResource($epic);
    }

    public function update(Request $request, Project $project, Epic $epic): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
            'status'      => 'sometimes|in:open,in_progress,done',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date',
        ]);

        $epic->update($validated);

        return response()->json(['data' => new EpicResource($epic->fresh())]);
    }

    public function destroy(Project $project, Epic $epic): JsonResponse
    {
        $this->authorize('update', $project);

        $epic->delete();

        return response()->json(['message' => 'Epic đã bị xóa']);
    }
}
