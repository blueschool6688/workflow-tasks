<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskWorkLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'task_id'        => $this->task_id,
            'user_id'        => $this->user_id,
            'user'           => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'minutes_logged' => $this->minutes_logged,
            'logged_at'      => $this->logged_at?->toIso8601String(),
            'description'    => $this->description,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
