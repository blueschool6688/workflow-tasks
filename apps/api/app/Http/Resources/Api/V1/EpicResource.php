<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'project_id'  => $this->project_id,
            'title'       => $this->name,
            'description' => $this->summary,
            'color'       => $this->color,
            'tasks_count' => $this->whenCounted('tasks'),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
