<?php

namespace App\Events;

use App\Models\ProjectMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectMessagePinned implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $pinnedData;

    public function __construct(
        public string $projectId,
        public ?ProjectMessage $message = null,
        public bool $isPinned = true
    ) {
        if ($this->message) {
            $this->message->load(['user', 'pinnedBy']);
            $this->pinnedData = [
                'project_id' => $this->projectId,
                'is_pinned' => $this->isPinned,
                'message' => [
                    'id' => $this->message->id,
                    'content' => $this->message->content,
                    'attachments' => $this->message->attachments,
                    'created_at' => $this->message->created_at?->toISOString() ?? now()->toISOString(),
                    'user' => [
                        'id' => $this->message->user->id,
                        'name' => $this->message->user->name,
                        'avatar' => $this->message->user->avatar,
                    ],
                    'pinned_by' => $this->message->pinnedBy ? [
                        'id' => $this->message->pinnedBy->id,
                        'name' => $this->message->pinnedBy->name,
                    ] : null,
                    'pinned_at' => $this->message->pinned_at?->toISOString(),
                ],
            ];
        } else {
            $this->pinnedData = [
                'project_id' => $this->projectId,
                'is_pinned' => false,
                'message' => null,
            ];
        }
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('project.' . $this->projectId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ProjectMessagePinned';
    }

    public function broadcastWith(): array
    {
        return $this->pinnedData;
    }
}
