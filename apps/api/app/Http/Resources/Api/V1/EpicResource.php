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
            'title'       => $this->title,
            'description' => $this->description,
            'color'       => $this->color,
            'status'      => $this->status,
            'start_date'  => $this->start_date?->toDateString(),
            'end_date'    => $this->end_date?->toDateString(),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
