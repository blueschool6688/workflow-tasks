<?php

namespace App\Providers;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Policies\OrganizationPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use App\Policies\WorkspacePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Organization::class, OrganizationPolicy::class);
        Gate::policy(Workspace::class, WorkspacePolicy::class);
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
    }
}
