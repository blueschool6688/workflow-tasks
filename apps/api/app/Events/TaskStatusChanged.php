<?php

namespace App\Events;

use App\Models\Notification;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $notificationData;
    public string $recipientId;

    public function __construct(
        public Task $task,
        public Notification $notification,
        public string $oldStatus,
        public string $newStatus,
        string $recipientId
    ) {
        $this->recipientId = $recipientId;
        $this->notificationData = [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'data' => $this->notification->data,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at?->toISOString() ?? now()->toISOString(),
            'sender' => $this->notification->sender ? [
                'id' => $this->notification->sender->id,
                'name' => $this->notification->sender->name,
                'avatar' => $this->notification->sender->avatar,
            ] : null,
            'task' => [
                'id' => $this->task->id,
                'task_number' => $this->task->task_number,
                'title' => $this->task->title,
                'project_key' => $this->task->project?->key,
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
            ],
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'TaskStatusChanged';
    }

    public function broadcastWith(): array
    {
        return $this->notificationData;
    }
}
