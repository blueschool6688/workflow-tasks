<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'workspace_id'    => $this->workspace_id,
            'name'            => $this->name,
            'key'             => $this->key,
            'description'     => $this->description,
            'type'            => $this->type,
            'status'          => $this->status,
            'workflow_id'     => $this->workflow_id,
            'lead_id'         => $this->lead_id,
            'lead'            => $this->whenLoaded('lead', fn () => new UserResource($this->lead)),
            'start_date'      => $this->start_date?->toDateString(),
            'target_end_date' => $this->target_end_date?->toDateString(),
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}
