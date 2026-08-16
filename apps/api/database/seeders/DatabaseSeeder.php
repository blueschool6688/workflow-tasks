<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Workspace;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Roles & Permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $workspaceAdminRole = Role::firstOrCreate(['name' => 'workspace-admin']);
        $projectManagerRole = Role::firstOrCreate(['name' => 'project-manager']);
        $memberRole = Role::firstOrCreate(['name' => 'member']);
        $guestRole = Role::firstOrCreate(['name' => 'guest']);

        \Illuminate\Support\Facades\Artisan::call('shield:generate', [
            '--all' => true,
            '--panel' => 'admin',
            '--option' => 'permissions',
            '--no-interaction' => true,
        ]);

        $superAdminRole->givePermissionTo(\Spatie\Permission\Models\Permission::all());

        // 2. Create Initial Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@tasks.local'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $admin->assignRole($superAdminRole);

        // 3. Create Default Organization & Workspace
        $org = Organization::firstOrCreate(
            ['slug' => 'tasks-corp'],
            [
                'name' => 'Tasks Corporation',
                'domain' => 'tasks.local',
                'settings' => ['theme' => 'system'],
            ]
        );

        $workspace = Workspace::firstOrCreate(
            ['organization_id' => $org->id, 'slug' => 'main-workspace'],
            [
                'name' => 'Core Product Workspace',
                'description' => 'Default primary workspace for core engineering and product management.',
                'is_active' => true,
            ]
        );

        $admin->current_workspace_id = $workspace->id;
        $admin->save();

        $workspace->members()->syncWithoutDetaching([
            $admin->id => ['role' => 'owner'],
        ]);

        // 4. Create Default Software Workflow (Jira-style: To Do -> In Progress -> In Review -> Done)
        $workflow = Workflow::firstOrCreate(
            ['workspace_id' => $workspace->id, 'is_default' => true],
            [
                'name' => 'Standard Software Workflow',
                'description' => 'Default workflow for software development tasks (To Do -> Doing -> Review -> Done)',
            ]
        );

        WorkflowStatus::firstOrCreate(
            ['workflow_id' => $workflow->id, 'slug' => 'todo'],
            ['name' => 'To Do', 'color' => '#64748b', 'order' => 1, 'category' => 'todo']
        );

        WorkflowStatus::firstOrCreate(
            ['workflow_id' => $workflow->id, 'slug' => 'in_progress'],
            ['name' => 'In Progress', 'color' => '#6366f1', 'order' => 2, 'category' => 'in_progress']
        );

        WorkflowStatus::firstOrCreate(
            ['workflow_id' => $workflow->id, 'slug' => 'in_review'],
            ['name' => 'In Review', 'color' => '#f59e0b', 'order' => 3, 'category' => 'in_progress']
        );

        WorkflowStatus::firstOrCreate(
            ['workflow_id' => $workflow->id, 'slug' => 'done'],
            ['name' => 'Done', 'color' => '#10b981', 'order' => 4, 'category' => 'done']
        );

        $this->call([
            JiraWorkflowSeeder::class,
            ComprehensiveDemoSeeder::class,
        ]);
    }
}
