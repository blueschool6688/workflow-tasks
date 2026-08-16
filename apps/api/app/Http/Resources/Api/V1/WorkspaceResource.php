<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'slug'            => $this->slug,
            'description'     => $this->description,
            'is_active'       => $this->is_active,
            'organization_id' => $this->organization_id,
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}
