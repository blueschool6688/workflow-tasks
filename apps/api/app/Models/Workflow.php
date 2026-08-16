<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function statuses()
    {
        return $this->hasMany(WorkflowStatus::class)->orderBy('order');
    }

    public function transitions()
    {
        return $this->hasMany(WorkflowTransition::class);
    }
}
