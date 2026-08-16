<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PaginationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page'      => ['sometimes', 'integer', 'min:1'],
            'per_page'  => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort'      => ['sometimes', 'string'],
            'direction' => ['sometimes', 'in:asc,desc'],
        ];
    }

    public function perPage(): int
    {
        return (int) $this->input('per_page', 20);
    }

    public function sortColumn(): string
    {
        return $this->input('sort', 'created_at');
    }

    public function sortDirection(): string
    {
        return $this->input('direction', 'desc');
    }
}
