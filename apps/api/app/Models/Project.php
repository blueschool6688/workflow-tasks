<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'workspace_id',
        'name',
        'key',
        'description',
        'type',
        'status',
        'workflow_id',
        'lead_id',
        'start_date',
        'target_end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'target_end_date' => 'date',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        if ($field) {
            return parent::resolveRouteBinding($value, $field);
        }

        if (\Illuminate\Support\Str::isUuid($value)) {
            return $this->where('id', $value)->first();
        }

        $cleanKey = str_replace('-', '', strtoupper($value));

        return $this->where('key', strtoupper($value))
            ->orWhere('key', strtolower($value))
            ->orWhere('key', $value)
            ->orWhere('key', $cleanKey)
            ->orWhere('key', str_replace('_', '-', strtoupper($value)))
            ->first();
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function lead()
    {
        return $this->belongsTo(User::class, 'lead_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->using(ProjectMember::class)
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function sprints()
    {
        return $this->hasMany(Sprint::class);
    }

    public function epics()
    {
        return $this->hasMany(Epic::class);
    }
}
