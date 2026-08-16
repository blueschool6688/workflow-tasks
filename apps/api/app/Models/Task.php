<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Task extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('task_workflow')
            ->setDescriptionForEvent(fn(string $eventName) => match($eventName) {
                'created' => 'Đã tạo nhiệm vụ',
                'updated' => 'Đã cập nhật thông tin nhiệm vụ',
                'deleted' => 'Đã xóa nhiệm vụ',
                default   => "Thao tác {$eventName} trên nhiệm vụ",
            });
    }

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

    public function resolveRouteBinding($value, $field = null)
    {
        if ($field) {
            return parent::resolveRouteBinding($value, $field);
        }

        if (\Illuminate\Support\Str::isUuid($value)) {
            return $this->where('id', $value)->first();
        }

        return $this->where('task_number', $value)
            ->orWhere('task_number', strtoupper($value))
            ->first();
    }

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
