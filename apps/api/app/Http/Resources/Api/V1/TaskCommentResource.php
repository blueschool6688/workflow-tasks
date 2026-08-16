<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskCommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'task_id'    => $this->task_id,
            'user_id'    => $this->user_id,
            'user'       => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'content'    => $this->body ?? $this->content,
            'body'       => $this->body ?? $this->content,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
