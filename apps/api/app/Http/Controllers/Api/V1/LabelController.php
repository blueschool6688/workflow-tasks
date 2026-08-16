<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\LabelResource;
use App\Models\Label;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LabelController extends Controller
{
    public function index(Workspace $workspace): AnonymousResourceCollection
    {
        $this->authorize('view', $workspace);

        return LabelResource::collection($workspace->labels()->get());
    }

    public function store(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $validated = $request->validate([
            'name'  => 'required|string|max:100',
            'color' => 'required|string|max:20',
        ]);

        $label = $workspace->labels()->create($validated);

        return response()->json(['data' => new LabelResource($label)], 201);
    }

    public function update(Request $request, Workspace $workspace, Label $label): JsonResponse
    {
        $this->authorize('update', $workspace);

        $label->update($request->validate([
            'name'  => 'sometimes|required|string|max:100',
            'color' => 'sometimes|string|max:20',
        ]));

        return response()->json(['data' => new LabelResource($label->fresh())]);
    }

    public function destroy(Workspace $workspace, Label $label): JsonResponse
    {
        $this->authorize('update', $workspace);

        $label->delete();

        return response()->json(['message' => 'Label đã bị xóa']);
    }
}
