<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'workspace_members')
                    ->using(WorkspaceMember::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function workflows()
    {
        return $this->hasMany(Workflow::class);
    }

    public function labels()
    {
        return $this->hasMany(Label::class);
    }
}
