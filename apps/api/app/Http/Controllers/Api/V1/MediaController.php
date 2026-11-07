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
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /** No svg/html/js: files are served from the API origin, so those would run as script there. */
    public const SAFE_UPLOAD_MIMES = 'mimes:jpg,jpeg,png,gif,webp,bmp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,md,zip,rar,7z,gz,tar,mp4,webm,mov,mp3,wav,m4a';

    public function index(PaginationRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $media = Media::query()
            ->when(! $user->isAdmin(), fn ($q) => $q->where('user_id', $user->id))
            ->when($request->input('type'), fn ($q, $v) => $q->where('mime_type', 'like', "{$v}%"))
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->paginate($request->perPage());

        return MediaResource::collection($media);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:51200', self::SAFE_UPLOAD_MIMES],
        ]);

        $file = $request->file('file');
        $path = $file->store('media/' . now()->format('Y/m'), 'public');

        $media = Media::create([
            'filename'   => $file->getClientOriginalName(),
            'disk'       => 'public',
            'path'       => $path,
            'mime_type'  => $file->getMimeType(),
            'type'       => Media::detectType($file->getMimeType(), $file->getClientOriginalName()),
            'size_bytes' => $file->getSize(),
            'user_id'    => $request->user()->id,
        ]);

        return response()->json(['data' => new MediaResource($media)], 201);
    }

    public function show(Request $request, Media $media): MediaResource
    {
        abort_unless($request->user()->isAdmin() || $media->user_id === $request->user()->id, 403);

        return new MediaResource($media);
    }

    public function destroy(Request $request, Media $media): JsonResponse
    {
        abort_unless($request->user()->isAdmin() || $media->user_id === $request->user()->id, 403);

        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return response()->json(['message' => 'Media đã bị xóa']);
    }

    public function attachToTask(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate(['media_id' => 'required|uuid|exists:media,id']);

        $media = Media::findOrFail($request->input('media_id'));
        abort_unless($request->user()->isAdmin() || $media->user_id === $request->user()->id, 403);

        $attachment = TaskAttachment::firstOrCreate([
            'task_id'  => $task->id,
            'media_id' => $media->id,
        ], [
            'user_id'    => $request->user()->id,
            'filename'   => $media->filename,
            'disk'       => $media->disk,
            'path'       => $media->path,
            'mime_type'  => $media->mime_type,
            'size_bytes' => $media->size_bytes,
        ]);

        return response()->json(['data' => $attachment], 201);
    }

    public function detachFromTask(Task $task, TaskAttachment $attachment): JsonResponse
    {
        $this->authorize('update', $task);

        $attachment->delete();

        return response()->json(['message' => 'Attachment đã bị xóa']);
    }
}
