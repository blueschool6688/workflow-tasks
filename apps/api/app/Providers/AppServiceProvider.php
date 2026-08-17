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

use Laravel\Passport\Passport;

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

        Passport::tokensCan([
            'read:profile'  => 'Xem thông tin hồ sơ tài khoản',
            'read:tasks'    => 'Xem danh sách dự án, công việc và sprint',
            'write:tasks'   => 'Tạo, cập nhật và xóa công việc/dự án',
            'read:chat'     => 'Xem lịch sử tin nhắn chatbox dự án',
            'write:chat'    => 'Gửi tin nhắn và file đính kèm trong chatbox',
            'admin:all'     => 'Toàn quyền quản trị hệ thống (Full Admin Access)',
        ]);

        Passport::setDefaultScope([
            'read:profile',
            'read:tasks',
            'write:tasks',
            'read:chat',
            'write:chat',
        ]);
    }
}
