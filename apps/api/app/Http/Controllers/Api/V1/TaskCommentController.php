<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskCommentController extends Controller
{
    public function index(Task $task): AnonymousResourceCollection
    {
        $this->authorize('view', $task);

        $comments = $task->comments()->with('user')->latest()->get();

        return TaskCommentResource::collection($comments);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $request->validate([
            'content' => 'required_without:body|string|max:5000',
            'body'    => 'required_without:content|string|max:5000',
        ]);

        $body = $request->input('content') ?? $request->input('body');

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body'    => $body,
        ]);

        return response()->json(['data' => new TaskCommentResource($comment->load('user'))], 201);
    }

    public function update(Request $request, Task $task, TaskComment $comment): JsonResponse
    {
        abort_unless($comment->user_id === $request->user()->id, 403, 'Chỉ tác giả mới có thể sửa bình luận');

        $request->validate([
            'content' => 'required_without:body|string|max:5000',
            'body'    => 'required_without:content|string|max:5000',
        ]);

        $body = $request->input('content') ?? $request->input('body');
        $comment->update(['body' => $body]);

        return response()->json(['data' => new TaskCommentResource($comment->fresh()->load('user'))]);
    }

    public function destroy(Request $request, Task $task, TaskComment $comment): JsonResponse
    {
        $isOwner = $comment->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        abort_unless($isOwner || $isAdmin, 403, 'Không có quyền xóa bình luận này');

        $comment->delete();

        return response()->json(['message' => 'Bình luận đã bị xóa']);
    }
}
