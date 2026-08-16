<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SprintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'project_id' => $this->project_id,
            'name'       => $this->name,
            'goal'       => $this->goal,
            'status'     => $this->status,
            'start_date' => $this->start_date?->toIso8601String(),
            'end_date'   => $this->end_date?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
