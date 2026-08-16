<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WorkflowResource;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkflowController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return WorkflowResource::collection(Workflow::with('statuses')->get());
    }

    public function show(Workflow $workflow): WorkflowResource
    {
        return new WorkflowResource($workflow->load('statuses'));
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

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
        abort_unless($request->user()->role === 'admin', 403);

        $workflow->update($request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_default'  => 'sometimes|boolean',
        ]));

        return response()->json(['data' => new WorkflowResource($workflow->fresh()->load('statuses'))]);
    }

    public function destroy(Request $request, Workflow $workflow): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $workflow->delete();

        return response()->json(['message' => 'Workflow đã bị xóa']);
    }

    public function storeStatus(Request $request, Workflow $workflow): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

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
        abort_unless($request->user()->role === 'admin', 403);

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
        abort_unless($request->user()->role === 'admin', 403);

        $status->delete();

        return response()->json(['message' => 'Status đã bị xóa']);
    }
}
