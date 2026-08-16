<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->when($request->input('search'), fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role'      => 'sometimes|in:admin,member',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json(['message' => 'Người dùng đã bị xóa']);
    }
}
