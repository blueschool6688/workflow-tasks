<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrganizationController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $orgs = Organization::query()
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return OrganizationResource::collection($orgs);
    }

    public function show(Organization $organization): OrganizationResource
    {
        return new OrganizationResource($organization);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Organization::class);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|unique:organizations,slug',
            'description' => 'nullable|string',
        ]);

        $organization = Organization::create($validated);

        return response()->json(['data' => new OrganizationResource($organization)], 201);
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $organization->update($validated);

        return response()->json(['data' => new OrganizationResource($organization->fresh())]);
    }

    public function destroy(Organization $organization): JsonResponse
    {
        $this->authorize('delete', $organization);

        $organization->delete();

        return response()->json(['message' => 'Tổ chức đã bị xóa']);
    }
}
