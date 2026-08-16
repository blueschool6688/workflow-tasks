<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaginationRequest;
use App\Http\Resources\Api\V1\MediaResource;
use App\Models\Media;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MediaController extends Controller
{
    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $media = Media::query()
            ->when($request->input('type'), fn ($q, $v) => $q->where('mime_type', 'like', "{$v}%"))
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return MediaResource::collection($media);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file'       => 'required|file|max:51200',
            'collection' => 'nullable|string|max:100',
        ]);

        $file = $request->file('file');

        $media = new Media();
        $media->name            = $file->getClientOriginalName();
        $media->file_name       = $file->getClientOriginalName();
        $media->mime_type       = $file->getMimeType();
        $media->size            = $file->getSize();
        $media->collection_name = $request->input('collection', 'default');
        $media->disk            = 'public';
        $media->uploader_id     = $request->user()->id;

        $path = $file->store('media/' . now()->format('Y/m'), 'public');
        $media->file_name = basename($path);
        $media->save();

        return response()->json(['data' => new MediaResource($media)], 201);
    }

    public function show(Media $media): MediaResource
    {
        return new MediaResource($media);
    }

    public function destroy(Request $request, Media $media): JsonResponse
    {
        abort_unless($request->user()->role === 'admin' || $media->uploader_id === $request->user()->id, 403);

        $media->delete();

        return response()->json(['message' => 'Media đã bị xóa']);
    }

    /** Attach a media file to a task */
    public function attachToTask(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $request->validate(['media_id' => 'required|uuid|exists:media,id']);

        $attachment = TaskAttachment::firstOrCreate([
            'task_id'  => $task->id,
            'media_id' => $request->input('media_id'),
        ], [
            'uploader_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $attachment], 201);
    }

    public function detachFromTask(Task $task, TaskAttachment $attachment): JsonResponse
    {
        $attachment->delete();

        return response()->json(['message' => 'Attachment đã bị xóa']);
    }
}
