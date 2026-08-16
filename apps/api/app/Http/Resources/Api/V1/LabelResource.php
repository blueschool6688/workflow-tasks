<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LabelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'workspace_id' => $this->workspace_id,
            'name'         => $this->name,
            'color'        => $this->color,
            'created_at'   => $this->created_at?->toIso8601String(),
        ];
    }
}
