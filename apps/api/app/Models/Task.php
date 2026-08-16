<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'project_id',
        'task_number',
        'title',
        'description',
        'brain_notes',
        'type',
        'status_id',
        'priority',
        'assignee_id',
        'reporter_id',
        'parent_task_id',
        'sprint_id',
        'epic_id',
        'due_date',
        'estimate_minutes',
        'time_spent_minutes',
        'order',
        'labels',
        'custom_fields',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'labels' => 'array',
        'custom_fields' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function status()
    {
        return $this->belongsTo(WorkflowStatus::class, 'status_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function epic()
    {
        return $this->belongsTo(Epic::class);
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function workLogs()
    {
        return $this->hasMany(TaskWorkLog::class);
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }
}
