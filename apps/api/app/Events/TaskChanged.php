<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/** Tells board/backlog clients to refetch; the payload is a hint, not the full task. */
class TaskChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $projectId,
        public ?string $projectKey,
        public string $action,
        public ?string $taskId,
        public int|string|null $actorId,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('project.' . $this->projectId)];

        if ($this->projectKey) {
            $channels[] = new PrivateChannel('project.' . $this->projectKey);
            $channels[] = new PrivateChannel('project.' . strtolower($this->projectKey));
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'TaskChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'action'     => $this->action,
            'task_id'    => $this->taskId,
            'project_id' => $this->projectId,
            'actor_id'   => $this->actorId,
        ];
    }

    /** Broadcast once the surrounding transaction commits; a socket failure must never fail the write. */
    public static function dispatchFor(string $projectId, string $action, ?string $taskId = null): void
    {
        $actorId = auth()->id();

        \Illuminate\Support\Facades\DB::afterCommit(function () use ($projectId, $action, $taskId, $actorId) {
            rescue(function () use ($projectId, $action, $taskId, $actorId) {
                $key = \App\Models\Project::whereKey($projectId)->value('key');
                broadcast(new self($projectId, $key, $action, $taskId, $actorId));
            }, report: false);
        });
    }
}
