<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowTransition extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workflow_id',
        'from_status_id',
        'to_status_id',
        'name',
        'rules',
    ];

    protected $casts = [
        'rules' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function fromStatus()
    {
        return $this->belongsTo(WorkflowStatus::class, 'from_status_id');
    }

    public function toStatus()
    {
        return $this->belongsTo(WorkflowStatus::class, 'to_status_id');
    }
}
