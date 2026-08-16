<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\Organization;
use App\Models\Workspace;
use App\Models\Project;
use App\Models\Task;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SystemOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('Active system users')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Organizations', Organization::count())
                ->description('Registered companies')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('success'),

            Stat::make('Active Workspaces', Workspace::where('is_active', true)->count())
                ->description('Productive workspaces')
                ->descriptionIcon('heroicon-m-squares-2x2')
                ->color('warning'),

            Stat::make('Total Projects', Project::count())
                ->description('Scrum & Kanban projects')
                ->descriptionIcon('heroicon-m-folder')
                ->color('info'),

            Stat::make('Total Tasks', Task::count())
                ->description('Managed tasks & issues')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('primary'),
        ];
    }
}
