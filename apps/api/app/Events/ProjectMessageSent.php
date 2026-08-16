<?php

namespace App\Events;

use App\Models\ProjectMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $messageData;

    public function __construct(public ProjectMessage $message)
    {
        $this->message->load(['user', 'replyTo.user']);

        $this->messageData = [
            'id' => $this->message->id,
            'project_id' => $this->message->project_id,
            'content' => $this->message->content,
            'attachments' => $this->message->attachments,
            'is_system' => $this->message->is_system,
            'reply_to_id' => $this->message->reply_to_id,
            'reply_to' => $this->message->replyTo ? [
                'id' => $this->message->replyTo->id,
                'content' => $this->message->replyTo->content,
                'user' => [
                    'id' => $this->message->replyTo->user?->id,
                    'name' => $this->message->replyTo->user?->name,
                ],
            ] : null,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'avatar' => $this->message->user->avatar,
            ],
            'created_at' => $this->message->created_at?->toISOString() ?? now()->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('project.' . $this->message->project_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ProjectMessageSent';
    }

    public function broadcastWith(): array
    {
        return $this->messageData;
    }
}
