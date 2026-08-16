<?php

namespace App\Services;

use App\Events\TaskStatusChanged;
use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Resolve unique recipient user IDs who should receive the notification,
     * excluding the actor who performed the action.
     */
    public function resolveTaskStatusRecipients(Task $task, ?User $actor = null): Collection
    {
        $recipientIds = collect();

        // 1. Assignee
        if ($task->assignee_id) {
            $recipientIds->push($task->assignee_id);
        }

        // 2. Reporter / Consignee
        if ($task->reporter_id) {
            $recipientIds->push($task->reporter_id);
        }

        // 3. Project Lead
        if ($task->project?->lead_id) {
            $recipientIds->push($task->project->lead_id);
        }

        // 4. Project Admins from project_members
        if ($task->project) {
            $adminIds = $task->project->members()
                ->wherePivot('role_in_project', 'admin')
                ->pluck('users.id');

            $recipientIds = $recipientIds->merge($adminIds);
        }

        // Filter unique and exclude actor
        return $recipientIds
            ->unique()
            ->filter(fn ($id) => $actor === null || (string) $id !== (string) $actor->id)
            ->values();
    }

    /**
     * Create persistent Notification records and broadcast real-time events.
     */
    public function notifyTaskStatusChanged(Task $task, string $oldStatus, string $newStatus, ?User $actor = null): void
    {
        $recipients = $this->resolveTaskStatusRecipients($task, $actor);
        $task->loadMissing(['project', 'assignee', 'reporter']);

        $actorName = $actor?->name ?? 'Một thành viên';
        $taskRef = $task->task_number ?: $task->title;

        $title = "Cập nhật trạng thái {$taskRef}";
        $message = "{$actorName} đã chuyển trạng thái từ '{$oldStatus}' sang '{$newStatus}'";

        foreach ($recipients as $recipientId) {
            $notification = Notification::create([
                'user_id' => $recipientId,
                'sender_id' => $actor?->id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'type' => 'task_status_changed',
                'title' => $title,
                'message' => $message,
                'data' => [
                    'task_id' => $task->id,
                    'task_number' => $task->task_number,
                    'task_title' => $task->title,
                    'project_key' => $task->project?->key,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
                'is_read' => false,
            ]);

            try {
                broadcast(new TaskStatusChanged($task, $notification, $oldStatus, $newStatus, (string) $recipientId));
            } catch (\Throwable $e) {
                // Log or ignore broadcast delivery error so DB transaction is not interrupted
                \Illuminate\Support\Facades\Log::warning("Broadcast failed for notification {$notification->id}: " . $e->getMessage());
            }
        }
    }
}
