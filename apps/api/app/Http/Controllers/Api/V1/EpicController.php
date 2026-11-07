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

        return EpicResource::collection($project->epics()->withCount('tasks')->orderBy('created_at')->get());
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $epic = $project->epics()->create($this->validated($request, 'required'));

        return response()->json(['data' => new EpicResource($epic)], 201);
    }

    public function show(Project $project, Epic $epic): EpicResource
    {
        $this->authorize('view', $project);

        return new EpicResource($epic->loadCount('tasks'));
    }

    public function update(Request $request, Project $project, Epic $epic): JsonResponse
    {
        $this->authorize('update', $project);

        $epic->update($this->validated($request, 'sometimes|required'));

        return response()->json(['data' => new EpicResource($epic->fresh())]);
    }

    public function destroy(Project $project, Epic $epic): JsonResponse
    {
        $this->authorize('update', $project);

        $epic->delete();

        return response()->json(['message' => 'Epic đã bị xóa']);
    }

    /** API speaks title/description; the table stores name/summary. */
    private function validated(Request $request, string $titleRule): array
    {
        $data = $request->validate([
            'title'       => "{$titleRule}|string|max:255",
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        return array_filter([
            'name'    => $data['title'] ?? null,
            'summary' => $data['description'] ?? null,
            'color'   => $data['color'] ?? null,
        ], fn ($v) => $v !== null);
    }
}
