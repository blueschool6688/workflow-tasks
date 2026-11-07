<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\TaskChanged;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SprintResource;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

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

        $sprint = $project->sprints()->create(array_merge($validated, ['status' => 'future']));

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

        abort_unless($sprint->status === 'future', 422, 'Chỉ có thể bắt đầu Sprint chưa diễn ra.');
        abort_if(
            $project->sprints()->where('status', 'active')->exists(),
            422,
            'Dự án đang có một Sprint diễn ra. Hãy hoàn tất Sprint đó trước.'
        );

        $sprint->update([
            'status'     => 'active',
            'start_date' => $sprint->start_date ?? now(),
        ]);

        return response()->json(['data' => new SprintResource($sprint->fresh())]);
    }

    /** Unfinished tasks go to `move_to` (a future sprint of this project) or back to the backlog. */
    public function complete(Request $request, Project $project, Sprint $sprint): JsonResponse
    {
        $this->authorize('update', $project);

        abort_unless($sprint->status === 'active', 422, 'Chỉ có thể hoàn tất Sprint đang diễn ra.');

        $validated = $request->validate([
            'move_to' => [
                'nullable', 'uuid', 'different:' . $sprint->id,
                Rule::exists('sprints', 'id')->where('project_id', $project->id)->where('status', 'future'),
            ],
        ]);
        $target = $validated['move_to'] ?? null;

        $moved = DB::transaction(function () use ($sprint, $target) {
            $moved = $sprint->tasks()
                ->whereDoesntHave('status', fn ($q) => $q->where('category', 'done'))
                ->update(['sprint_id' => $target]);

            $sprint->update([
                'status'   => 'completed',
                'end_date' => $sprint->end_date ?? now(),
            ]);

            // Bulk update skips model events, so announce it once here.
            TaskChanged::dispatchFor($sprint->project_id, 'bulk');

            return $moved;
        });

        return response()->json([
            'data'        => new SprintResource($sprint->fresh()),
            'moved_count' => $moved,
            'moved_to'    => $target,
        ]);
    }
}
