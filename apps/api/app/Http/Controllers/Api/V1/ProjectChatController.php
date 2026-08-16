<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\ProjectMessagePinned;
use App\Events\ProjectMessageSent;
use App\Events\TypingIndicator;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectChatController extends Controller
{
    /**
     * List messages for a project with author details, reply threads, pinned message, and task list.
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $limit = min(max((int) $request->input('limit', 50), 1), 100);
        $cursor = $request->input('cursor') ?? $request->input('before_id') ?? $request->input('before_cursor') ?? $request->input('before');

        $query = ProjectMessage::query()
            ->where('project_id', $project->id)
            ->with(['user:id,name,avatar', 'replyTo.user:id,name', 'pinnedBy:id,name'])
            ->orderBy('sequence_id', 'desc');

        if ($cursor) {
            if (is_numeric($cursor)) {
                $query->where('sequence_id', '<', (int) $cursor);
            } elseif (\Illuminate\Support\Str::isUuid($cursor)) {
                $refMsg = ProjectMessage::find($cursor);
                if ($refMsg && $refMsg->sequence_id) {
                    $query->where('sequence_id', '<', $refMsg->sequence_id);
                }
            } else {
                // Fallback for timestamp strings
                $query->where('created_at', '<', $cursor);
            }
        }

        // Fetch limit + 1 to calculate has_more
        $rawMessages = $query->limit($limit + 1)->get();
        $hasMore = $rawMessages->count() > $limit;

        if ($hasMore) {
            $rawMessages = $rawMessages->slice(0, $limit);
        }

        $nextCursor = null;
        if ($rawMessages->isNotEmpty()) {
            $oldest = $rawMessages->last();
            $nextCursor = $oldest->sequence_id;
        }

        $messages = $rawMessages->reverse()->values();

        // Fetch project members for presence header and @member mention
        $members = $project->members()->select('users.id', 'users.name', 'users.avatar')->get();

        // Fetch tasks in project for @task / #task autocomplete
        $tasks = $project->tasks()
            ->select('id', 'task_number', 'title', 'status_id', 'priority')
            ->with('status:id,name,color')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        // Fetch currently pinned message (if any)
        $pinnedMessage = ProjectMessage::query()
            ->where('project_id', $project->id)
            ->where('is_pinned', true)
            ->with(['user:id,name,avatar', 'pinnedBy:id,name'])
            ->latest('pinned_at')
            ->first();

        return response()->json([
            'data' => $messages,
            'members' => $members,
            'tasks' => $tasks,
            'pinned_message' => $pinnedMessage,
            'project' => [
                'id' => $project->id,
                'key' => $project->key,
                'name' => $project->name,
            ],
            'pagination' => [
                'limit' => $limit,
                'has_more' => $hasMore,
                'next_cursor' => $hasMore ? $nextCursor : null,
            ],
        ]);
    }

    /**
     * Upload an attachment/image for chat message.
     */
    public function upload(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $request->validate([
            'file' => 'required|file|max:20480', // 20MB max
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType() ?? '';
        $originalName = $file->getClientOriginalName();
        $size = $file->getSize();

        $path = $file->store('chat-attachments/' . $project->id . '/' . now()->format('Y/m'), 'public');
        $url = Storage::disk('public')->url($path);

        $isImage = str_starts_with($mime, 'image/') || in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);

        return response()->json([
            'data' => [
                'name' => $originalName,
                'url' => $url,
                'size' => $size,
                'type' => $isImage ? 'image' : 'file',
                'mime_type' => $mime,
            ],
            'message' => 'Tệp đính kèm đã được tải lên',
        ]);
    }

    /**
     * Send a new message to the project chat channel.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $validated = $request->validate([
            'content' => 'required_without:attachments|nullable|string|max:5000',
            'attachments' => 'nullable|array',
            'reply_to_id' => 'nullable|uuid|exists:project_messages,id',
        ]);

        $message = ProjectMessage::create([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'content' => $validated['content'] ?? '',
            'attachments' => $validated['attachments'] ?? null,
            'reply_to_id' => $validated['reply_to_id'] ?? null,
            'is_system' => false,
            'is_pinned' => false,
        ]);

        $message->load(['user:id,name,avatar', 'replyTo.user:id,name']);

        try {
            broadcast(new ProjectMessageSent($message));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to broadcast project message {$message->id}: " . $e->getMessage());
        }

        return response()->json([
            'data' => $message,
            'message' => 'Tin nhắn đã được gửi',
        ], 201);
    }

    /**
     * Pin or unpin a chat message (Single pinned message per project rule).
     */
    public function pin(Request $request, Project $project, ProjectMessage $message): JsonResponse
    {
        $this->authorize('view', $project);

        if ((string) $message->project_id !== (string) $project->id) {
            return response()->json(['message' => 'Message does not belong to project'], 404);
        }

        if ($message->is_pinned) {
            // Unpin
            $message->update([
                'is_pinned' => false,
                'pinned_at' => null,
                'pinned_by_id' => null,
            ]);

            try {
                broadcast(new ProjectMessagePinned($project->id, null, false));
            } catch (\Throwable $e) {
                // Ignore socket error
            }

            return response()->json([
                'data' => $message->fresh(),
                'is_pinned' => false,
                'message' => 'Đã bỏ ghim tin nhắn',
            ]);
        } else {
            // Unpin any other pinned message in this project
            ProjectMessage::where('project_id', $project->id)
                ->where('is_pinned', true)
                ->update([
                    'is_pinned' => false,
                    'pinned_at' => null,
                    'pinned_by_id' => null,
                ]);

            // Pin this message
            $message->update([
                'is_pinned' => true,
                'pinned_at' => now(),
                'pinned_by_id' => $request->user()->id,
            ]);

            $message->load(['user:id,name,avatar', 'pinnedBy:id,name']);

            try {
                broadcast(new ProjectMessagePinned($project->id, $message, true));
            } catch (\Throwable $e) {
                // Ignore socket error
            }

            return response()->json([
                'data' => $message,
                'is_pinned' => true,
                'message' => 'Đã ghim tin nhắn vào kênh dự án',
            ]);
        }
    }

    /**
     * Delete a chat message.
     */
    public function destroy(Request $request, Project $project, ProjectMessage $message): JsonResponse
    {
        $this->authorize('view', $project);

        if ((string) $message->project_id !== (string) $project->id) {
            return response()->json(['message' => 'Message does not belong to project'], 404);
        }

        $user = $request->user();
        $isAuthor = (string) $message->user_id === (string) $user->id;
        $isProjectLead = (string) $project->lead_id === (string) $user->id;
        $isProjectAdmin = $project->members()
            ->where('users.id', $user->id)
            ->wherePivot('role_in_project', 'admin')
            ->exists();

        if (!$isAuthor && !$isProjectLead && !$isProjectAdmin) {
            return response()->json(['message' => 'Bạn không có quyền xóa tin nhắn này'], 403);
        }

        $wasPinned = $message->is_pinned;
        $message->delete();

        if ($wasPinned) {
            try {
                broadcast(new ProjectMessagePinned($project->id, null, false));
            } catch (\Throwable $e) {
                // Ignore socket error
            }
        }

        return response()->json([
            'message' => 'Tin nhắn đã bị xóa',
        ]);
    }

    /**
     * Broadcast typing status to project members.
     */
    public function typing(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $isTyping = $request->boolean('is_typing', true);

        try {
            broadcast(new TypingIndicator($project->id, $request->user(), $isTyping));
        } catch (\Throwable $e) {
            // Ignore socket delivery error
        }

        return response()->json(['success' => true]);
    }
}
