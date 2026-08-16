<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingIndicator implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $projectId,
        public User $user,
        public bool $isTyping = true
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('project.' . $this->projectId),
        ];

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'TypingIndicator';
    }

    public function broadcastWith(): array
    {
        return [
            'project_id' => $this->projectId,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'is_typing' => $this->isTyping,
        ];
    }
}
