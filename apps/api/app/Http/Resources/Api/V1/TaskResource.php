<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'project_id'       => $this->project_id,
            'task_number'      => $this->task_number,
            'title'            => $this->title,
            'description'      => $this->description,
            'type'             => $this->type,
            'status_id'        => $this->status_id,
            'status'           => $this->whenLoaded('status', fn () => [
                'id'    => $this->status->id,
                'name'  => $this->status->name,
                'color' => $this->status->color,
            ]),
            'priority'         => $this->priority,
            'assignee_id'      => $this->assignee_id,
            'assignee'         => $this->whenLoaded('assignee', fn () => new UserResource($this->assignee)),
            'reporter_id'      => $this->reporter_id,
            'reporter'         => $this->whenLoaded('reporter', fn () => new UserResource($this->reporter)),
            'sprint_id'        => $this->sprint_id,
            'epic_id'          => $this->epic_id,
            'parent_task_id'   => $this->parent_task_id,
            'due_date'         => $this->due_date?->toDateString(),
            'estimate_minutes' => $this->estimate_minutes,
            'time_spent_minutes' => $this->time_spent_minutes,
            'order'            => $this->order,
            'labels'           => $this->labels ?? [],
            'created_at'       => $this->created_at?->toIso8601String(),
            'updated_at'       => $this->updated_at?->toIso8601String(),
        ];
    }
}
