<?php

namespace Database\Seeders;

use App\Models\Workflow;
use App\Models\WorkflowStatus;
use App\Models\WorkflowTransition;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class JiraWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $workspace = Workspace::first();

        $workflow = Workflow::firstOrCreate(
            ['name' => 'Jira Standard Workflow'],
            [
                'workspace_id' => $workspace?->id,
                'description' => 'Comprehensive Jira-style software engineering workflow with 11 statuses and 17 transitions.',
                'is_default' => false,
            ]
        );

        $statusData = [
            ['slug' => 'backlog', 'name' => 'Backlog', 'color' => '#64748b', 'order' => 1, 'category' => 'todo'],
            ['slug' => 'refinement', 'name' => 'Làm rõ yêu cầu', 'color' => '#475569', 'order' => 2, 'category' => 'todo'],
            ['slug' => 'ready', 'name' => 'Sẵn sàng (Sprint)', 'color' => '#3b82f6', 'order' => 3, 'category' => 'todo'],
            ['slug' => 'in_progress', 'name' => 'Đang code', 'color' => '#6366f1', 'order' => 4, 'category' => 'in_progress'],
            ['slug' => 'blocked', 'name' => 'Bị chặn', 'color' => '#ef4444', 'order' => 5, 'category' => 'in_progress'],
            ['slug' => 'code_review', 'name' => 'Code review', 'color' => '#8b5cf6', 'order' => 6, 'category' => 'in_progress'],
            ['slug' => 'testing', 'name' => 'QA / Testing', 'color' => '#f59e0b', 'order' => 7, 'category' => 'in_progress'],
            ['slug' => 'uat', 'name' => 'UAT / Staging', 'color' => '#a855f7', 'order' => 8, 'category' => 'in_progress'],
            ['slug' => 'deploying', 'name' => 'Deploy production', 'color' => '#06b6d4', 'order' => 9, 'category' => 'in_progress'],
            ['slug' => 'done', 'name' => 'Hoàn thành', 'color' => '#10b981', 'order' => 10, 'category' => 'done'],
            ['slug' => 'cancelled', 'name' => 'Hủy / Won\'t Do', 'color' => '#334155', 'order' => 11, 'category' => 'done'],
        ];

        $statuses = [];
        foreach ($statusData as $data) {
            $statuses[$data['slug']] = WorkflowStatus::firstOrCreate(
                ['workflow_id' => $workflow->id, 'slug' => $data['slug']],
                $data
            );
        }

        $transitionMatrix = [
            ['from' => 'backlog', 'to' => 'refinement', 'name' => 'Refine Requirement', 'roles' => ['product_owner', 'ba']],
            ['from' => 'refinement', 'to' => 'ready', 'name' => 'Approve for Sprint', 'roles' => ['scrum_master', 'product_owner']],
            ['from' => 'ready', 'to' => 'in_progress', 'name' => 'Start Development', 'roles' => ['developer']],
            ['from' => 'in_progress', 'to' => 'blocked', 'name' => 'Flag Blocked', 'roles' => ['developer']],
            ['from' => 'blocked', 'to' => 'in_progress', 'name' => 'Unblock', 'roles' => ['developer', 'scrum_master']],
            ['from' => 'in_progress', 'to' => 'code_review', 'name' => 'Create Pull Request', 'roles' => ['developer']],
            ['from' => 'code_review', 'to' => 'in_progress', 'name' => 'Request Changes', 'roles' => ['reviewer']],
            ['from' => 'code_review', 'to' => 'testing', 'name' => 'Approve & Merge PR', 'roles' => ['reviewer']],
            ['from' => 'testing', 'to' => 'in_progress', 'name' => 'Fail QA Test', 'roles' => ['qa']],
            ['from' => 'testing', 'to' => 'uat', 'name' => 'Pass QA Test', 'roles' => ['qa']],
            ['from' => 'uat', 'to' => 'deploying', 'name' => 'Approve UAT', 'roles' => ['product_owner', 'stakeholder']],
            ['from' => 'uat', 'to' => 'in_progress', 'name' => 'Reject UAT', 'roles' => ['product_owner']],
            ['from' => 'deploying', 'to' => 'done', 'name' => 'Deploy Successful', 'roles' => ['devops']],
            ['from' => 'done', 'to' => 'ready', 'name' => 'Reopen Issue', 'roles' => ['any']],
            ['from' => 'backlog', 'to' => 'cancelled', 'name' => 'Cancel Issue', 'roles' => ['product_owner']],
            ['from' => 'refinement', 'to' => 'cancelled', 'name' => 'Cancel Issue', 'roles' => ['product_owner']],
            ['from' => 'ready', 'to' => 'cancelled', 'name' => 'Cancel Issue', 'roles' => ['product_owner']],
        ];

        foreach ($transitionMatrix as $t) {
            WorkflowTransition::firstOrCreate(
                [
                    'workflow_id' => $workflow->id,
                    'from_status_id' => $statuses[$t['from']]->id,
                    'to_status_id' => $statuses[$t['to']]->id,
                ],
                [
                    'name' => $t['name'],
                    'rules' => ['allowed_roles' => $t['roles']],
                ]
            );
        }
    }
}
