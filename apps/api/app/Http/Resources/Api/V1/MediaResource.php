<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'file_name'   => $this->file_name,
            'mime_type'   => $this->mime_type,
            'size'        => $this->size,
            'url'         => $this->getUrl(),
            'collection'  => $this->collection_name,
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
