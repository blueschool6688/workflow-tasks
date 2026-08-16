<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'logo'        => $this->logo ? asset('storage/' . $this->logo) : null,
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
