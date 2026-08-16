<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class BaseResource extends JsonResource
{
    public function toResponse($request): JsonResponse
    {
        return response()->json([
            'data' => $this->toArray($request),
        ]);
    }
}
