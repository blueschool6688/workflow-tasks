<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'email'                => $this->email,
            'avatar'               => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'role'                 => $this->role ?? 'member',
            'is_active'            => $this->is_active,
            'current_workspace_id' => $this->current_workspace_id,
            'created_at'           => $this->created_at?->toIso8601String(),
        ];
    }
}
