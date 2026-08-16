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

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
