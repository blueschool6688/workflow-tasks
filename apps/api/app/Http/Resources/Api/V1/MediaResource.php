<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->filename,
            'filename'   => $this->filename,
            'path'       => $this->path,
            'mime_type'  => $this->mime_type,
            'type'       => $this->type,
            'size'       => $this->size_bytes,
            'url'        => $this->url,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
