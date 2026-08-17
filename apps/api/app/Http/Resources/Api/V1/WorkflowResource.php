<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkflowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'workspace_id' => $this->workspace_id,
            'name'         => $this->name,
            'description'  => $this->description,
            'is_default'   => $this->is_default,
            'statuses'     => $this->whenLoaded('statuses', fn () => $this->statuses->map(fn ($s) => [
                'id'       => $s->id,
                'name'     => $s->name,
                'color'    => $s->color,
                'category' => $s->category,
                'order'    => $s->order,
            ])),
            'transitions'  => $this->whenLoaded('transitions', fn () => $this->transitions->map(fn ($t) => [
                'id'             => $t->id,
                'from_status_id' => $t->from_status_id,
                'to_status_id'   => $t->to_status_id,
                'name'           => $t->name,
                'rules'          => $t->rules,
            ])),
            'created_at'   => $this->created_at?->toIso8601String(),
        ];
    }
}
