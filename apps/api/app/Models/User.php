<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'current_workspace_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active && $this->isAdmin();
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['super-admin', 'admin']);
    }

    public function canAccessProject(Project $project): bool
    {
        if ($this->isAdmin() || (string) $project->lead_id === (string) $this->id) {
            return true;
        }

        if ($project->members()->where('users.id', $this->id)->exists()) {
            return true;
        }

        return $project->workspace_id
            && $this->workspaces()->where('workspaces.id', $project->workspace_id)->exists();
    }

    public function currentWorkspace()
    {
        return $this->belongsTo(Workspace::class, 'current_workspace_id');
    }

    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members')
                    ->using(WorkspaceMember::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_members')
                    ->using(ProjectMember::class)
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
