<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowStatus extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'name',
        'slug',
        'color',
        'order',
        'category',
    ];

    protected static function booted(): void
    {
        static::creating(function (WorkflowStatus $status) {
            if (empty($status->slug) && ! empty($status->name)) {
                $status->slug = \Illuminate\Support\Str::slug($status->name);
            }
        });
    }

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
