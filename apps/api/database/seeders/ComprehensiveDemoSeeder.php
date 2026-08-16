<?php

namespace Database\Seeders;

use App\Models\Epic;
use App\Models\Label;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\TaskWorkLog;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class ComprehensiveDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions Setup
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $workspaceAdminRole = Role::firstOrCreate(['name' => 'workspace-admin']);
        $projectManagerRole = Role::firstOrCreate(['name' => 'project-manager']);
        $memberRole = Role::firstOrCreate(['name' => 'member']);
        $guestRole = Role::firstOrCreate(['name' => 'guest']);

        // 2. Create Users (Realistic Team Members)
        $usersData = [
            [
                'email' => 'admin@tasks.local',
                'username' => 'admin',
                'name' => 'System Admin',
                'role' => $superAdminRole,
            ],
            [
                'email' => 'pm@tasks.local',
                'username' => 'pm',
                'name' => 'Alex Rivera (Product Manager)',
                'role' => $projectManagerRole,
            ],
            [
                'email' => 'dev1@tasks.local',
                'username' => 'dev1',
                'name' => 'Nguyen Van A (Senior Backend Dev)',
                'role' => $memberRole,
            ],
            [
                'email' => 'dev2@tasks.local',
                'username' => 'dev2',
                'name' => 'Tran Thi B (Frontend Engineer)',
                'role' => $memberRole,
            ],
            [
                'email' => 'qa@tasks.local',
                'username' => 'qa',
                'name' => 'Le Van C (QA Lead)',
                'role' => $memberRole,
            ],
            [
                'email' => 'devops@tasks.local',
                'username' => 'devops',
                'name' => 'Pham Van D (DevOps Specialist)',
                'role' => $memberRole,
            ],
        ];

        $users = [];
        foreach ($usersData as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'username' => $u['username'],
                    'name' => $u['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ]
            );
            $user->assignRole($u['role']);
            $users[$u['email']] = $user;
        }

        $adminUser = $users['admin@tasks.local'];
        $pmUser = $users['pm@tasks.local'];
        $dev1User = $users['dev1@tasks.local'];
        $dev2User = $users['dev2@tasks.local'];
        $qaUser = $users['qa@tasks.local'];
        $devopsUser = $users['devops@tasks.local'];

        // 3. Create Organizations & Workspaces
        $org = Organization::firstOrCreate(
            ['slug' => 'tasks-enterprise'],
            [
                'name' => 'Tasks Enterprise Global',
                'domain' => 'tasks.local',
                'settings' => ['theme' => 'system', 'language' => 'vi'],
            ]
        );

        $engWorkspace = Workspace::firstOrCreate(
            ['organization_id' => $org->id, 'slug' => 'engineering-product'],
            [
                'name' => 'Engineering & Product Workspace',
                'description' => 'Primary workspace for Core API, Mobile Apps, and Cloud Infrastructure.',
                'is_active' => true,
            ]
        );

        $growthWorkspace = Workspace::firstOrCreate(
            ['organization_id' => $org->id, 'slug' => 'marketing-growth'],
            [
                'name' => 'Marketing & Growth Workspace',
                'description' => 'Workspace for campaign management, SEO, and user acquisition.',
                'is_active' => true,
            ]
        );

        // Attach workspace memberships
        $engWorkspace->members()->syncWithoutDetaching([
            $adminUser->id => ['role' => 'owner'],
            $pmUser->id => ['role' => 'admin'],
            $dev1User->id => ['role' => 'member'],
            $dev2User->id => ['role' => 'member'],
            $qaUser->id => ['role' => 'member'],
            $devopsUser->id => ['role' => 'member'],
        ]);

        foreach ($users as $u) {
            if (!$u->current_workspace_id) {
                $u->current_workspace_id = $engWorkspace->id;
                $u->save();
            }
        }

        // 4. Seeding Jira Workflow & Statuses
        $this->call(JiraWorkflowSeeder::class);
        $jiraWorkflow = Workflow::where('name', 'Jira Standard Workflow')->first();
        $statuses = WorkflowStatus::where('workflow_id', $jiraWorkflow->id)->get()->keyBy('slug');

        // 5. Create Labels
        $labelsData = [
            ['name' => 'Backend', 'color' => '#8b5cf6'],
            ['name' => 'Frontend', 'color' => '#6366f1'],
            ['name' => 'Bug', 'color' => '#ef4444'],
            ['name' => 'Security', 'color' => '#dc2626'],
            ['name' => 'Database', 'color' => '#f59e0b'],
            ['name' => 'API', 'color' => '#06b6d4'],
            ['name' => 'DevOps', 'color' => '#10b981'],
        ];

        $labels = [];
        foreach ($labelsData as $l) {
            $labels[$l['name']] = Label::firstOrCreate(
                ['workspace_id' => $engWorkspace->id, 'name' => $l['name']],
                ['color' => $l['color']]
            );
        }

        // 6. Create Projects & Project Members
        $project1 = Project::firstOrCreate(
            ['workspace_id' => $engWorkspace->id, 'key' => 'TASK'],
            [
                'name' => 'Core Task Engine API',
                'description' => 'Backend API service with dynamic workflow engine, PostgreSQL multi-tenancy, and Redis real-time broadcasting.',
                'type' => 'scrum',
                'status' => 'active',
                'workflow_id' => $jiraWorkflow->id,
                'lead_id' => $pmUser->id,
                'start_date' => now()->subDays(30),
                'target_end_date' => now()->addDays(60),
            ]
        );

        $project2 = Project::firstOrCreate(
            ['workspace_id' => $engWorkspace->id, 'key' => 'MOBI'],
            [
                'name' => 'Mobile App (iOS & Android)',
                'description' => 'Cross-platform mobile application built with React Native and TailwindCSS.',
                'type' => 'kanban',
                'status' => 'active',
                'workflow_id' => $jiraWorkflow->id,
                'lead_id' => $dev2User->id,
                'start_date' => now()->subDays(15),
                'target_end_date' => now()->addDays(45),
            ]
        );

        $project3 = Project::firstOrCreate(
            ['workspace_id' => $engWorkspace->id, 'key' => 'CORE-ENG'],
            [
                'name' => 'Core Product Engineering',
                'description' => 'Flagship product engineering workspace for enterprise workflow automation and task tracking.',
                'type' => 'scrum',
                'status' => 'active',
                'workflow_id' => $jiraWorkflow->id,
                'lead_id' => $pmUser->id,
                'start_date' => now()->subDays(30),
                'target_end_date' => now()->addDays(90),
            ]
        );

        // Project Memberships
        $project1->members()->syncWithoutDetaching([
            $pmUser->id => ['role_in_project' => 'lead'],
            $dev1User->id => ['role_in_project' => 'developer'],
            $dev2User->id => ['role_in_project' => 'developer'],
            $qaUser->id => ['role_in_project' => 'reporter'],
            $devopsUser->id => ['role_in_project' => 'developer'],
        ]);

        $project2->members()->syncWithoutDetaching([
            $dev2User->id => ['role_in_project' => 'lead'],
            $dev1User->id => ['role_in_project' => 'developer'],
            $qaUser->id => ['role_in_project' => 'reporter'],
        ]);

        $project3->members()->syncWithoutDetaching([
            $adminUser->id => ['role_in_project' => 'lead'],
            $pmUser->id => ['role_in_project' => 'lead'],
            $dev1User->id => ['role_in_project' => 'developer'],
            $dev2User->id => ['role_in_project' => 'developer'],
            $qaUser->id => ['role_in_project' => 'reporter'],
            $devopsUser->id => ['role_in_project' => 'developer'],
        ]);

        // 7. Epics
        $epic1 = Epic::firstOrCreate(
            ['project_id' => $project1->id, 'name' => 'Epic: Auth & Multi-Tenancy Architecture'],
            [
                'summary' => 'Complete multi-tenant isolation, Sanctum tokens, Spatie RBAC, and Filament Admin integration.',
                'color' => '#8b5cf6',
            ]
        );

        $epic2 = Epic::firstOrCreate(
            ['project_id' => $project1->id, 'name' => 'Epic: Realtime Kanban & Workflow Engine'],
            [
                'summary' => 'State machine transitions validation, websocket events, and interactive drag-and-drop board.',
                'color' => '#10b981',
            ]
        );

        $epic3 = Epic::firstOrCreate(
            ['project_id' => $project2->id, 'name' => 'Epic: Mobile Push Notifications & Realtime Sync'],
            [
                'summary' => 'FCM push notifications for task assignment, status updates, and mentions.',
                'color' => '#f59e0b',
            ]
        );

        $epic4 = Epic::firstOrCreate(
            ['project_id' => $project3->id, 'name' => 'Epic: Enterprise Workflow & Task Hub'],
            [
                'summary' => 'Integrated Task Management with Sprint planning, Gantt timelines, and audit logs.',
                'color' => '#6366f1',
            ]
        );

        // 8. Sprints
        $sprint1 = Sprint::firstOrCreate(
            ['project_id' => $project1->id, 'name' => 'Sprint 1 - Foundation & Auth'],
            [
                'goal' => 'Setup PostgreSQL schema, Sanctum authentication, and initial Filament Resources.',
                'status' => 'completed',
                'start_date' => now()->subDays(14),
                'end_date' => now()->subDays(1),
            ]
        );

        $sprint2 = Sprint::firstOrCreate(
            ['project_id' => $project1->id, 'name' => 'Sprint 2 - Workflow Engine & Board'],
            [
                'goal' => 'Deliver Jira-style 11 status workflow state machine, ACL policies, and Kanban board API.',
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addDays(14),
            ]
        );

        $sprint3 = Sprint::firstOrCreate(
            ['project_id' => $project1->id, 'name' => 'Sprint 3 - Automation & Export'],
            [
                'goal' => 'Implement automated workflow triggers, PDF/Excel reports, and performance virtualized views.',
                'status' => 'future',
                'start_date' => now()->addDays(15),
                'end_date' => now()->addDays(29),
            ]
        );

        $sprint24 = Sprint::firstOrCreate(
            ['project_id' => $project3->id, 'name' => 'Sprint 24 (Sprint Hiện Tại)'],
            [
                'goal' => 'Hoàn thiện hệ thống xác thực, phân quyền và giao diện Task Detail 1000px.',
                'status' => 'active',
                'start_date' => now()->subDays(3),
                'end_date' => now()->addDays(11),
            ]
        );

        $sprint25 = Sprint::firstOrCreate(
            ['project_id' => $project3->id, 'name' => 'Sprint 25 (Kế hoạch tiếp theo)'],
            [
                'goal' => 'Tích hợp cổng thông báo Reverb WebSockets và xuất báo cáo PDF/Excel.',
                'status' => 'future',
                'start_date' => now()->addDays(12),
                'end_date' => now()->addDays(26),
            ]
        );

        // 9. Interactive Detailed Tasks Across All 11 Jira Statuses
        $tasksData = [
            [
                'task_number' => 'TASK-1',
                'title' => 'Setup PostgreSQL multi-tenant schema with workspace scoping',
                'type' => 'story',
                'status_slug' => 'done',
                'priority' => 'high',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic1,
                'sprint' => $sprint1,
                'estimate_minutes' => 480,
                'time_spent_minutes' => 450,
                'description' => "### Scope\n- Create `organizations`, `workspaces`, and `workspace_members` migrations.\n- Implement global Eloquent scope for tenant isolation.\n- Verify cascading deletes on workspace removal.",
                'labels' => [$labels['Backend']->id, $labels['Database']->id],
            ],
            [
                'task_number' => 'TASK-2',
                'title' => 'Implement Laravel Sanctum bearer token authentication',
                'type' => 'story',
                'status_slug' => 'done',
                'priority' => 'high',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic1,
                'sprint' => $sprint1,
                'estimate_minutes' => 240,
                'time_spent_minutes' => 240,
                'description' => "### Acceptance Criteria\n1. `POST /api/v1/auth/login` returns valid Sanctum bearer token.\n2. `GET /api/v1/auth/me` returns current user profile and current workspace.",
                'labels' => [$labels['Backend']->id, $labels['API']->id, $labels['Security']->id],
            ],
            [
                'task_number' => 'TASK-3',
                'title' => 'Fix foreign key constraint error on parent_task_id self-reference',
                'type' => 'bug',
                'status_slug' => 'code_review',
                'priority' => 'urgent',
                'assignee' => $dev1User,
                'reporter' => $qaUser,
                'epic' => $epic1,
                'sprint' => $sprint2,
                'estimate_minutes' => 120,
                'time_spent_minutes' => 90,
                'description' => "### Bug Reproduction\nRunning `php artisan migrate` fails with PostgreSQL error `Invalid foreign key: no unique constraint matching given keys for referenced table tasks`.\n\n### Fix Strategy\nMove `foreign('parent_task_id')` constraint definition to a separate `Schema::table()` call after table creation.",
                'labels' => [$labels['Backend']->id, $labels['Bug']->id, $labels['Database']->id],
            ],
            [
                'task_number' => 'TASK-4',
                'title' => 'Build Configurable Workflow Transition State Machine',
                'type' => 'task',
                'status_slug' => 'in_progress',
                'priority' => 'urgent',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 360,
                'time_spent_minutes' => 180,
                'description' => "### Technical Requirements\n- Validate transition path against `workflow_transitions` table.\n- Enforce `allowed_roles` rule validation on server-side.\n- Throw `InvalidTransitionException` if target status is prohibited.",
                'labels' => [$labels['Backend']->id, $labels['API']->id],
            ],
            [
                'task_number' => 'TASK-5',
                'title' => 'Implement dnd-kit drag and drop for Kanban Board columns',
                'type' => 'story',
                'status_slug' => 'testing',
                'priority' => 'high',
                'assignee' => $dev2User,
                'reporter' => $pmUser,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 480,
                'time_spent_minutes' => 420,
                'description' => "### UI Requirements\n- Smooth column reordering and card drag-and-drop using `dnd-kit` and `motion/react`.\n- Optimistic UI updates with rollback on network error.\n- Tactile active feedback with Geist font styling.",
                'labels' => [$labels['Frontend']->id],
            ],
            [
                'task_number' => 'TASK-6',
                'title' => 'Refactor Filament Admin Resources for v5.7 component structure',
                'type' => 'task',
                'status_slug' => 'uat',
                'priority' => 'medium',
                'assignee' => $dev2User,
                'reporter' => $qaUser,
                'epic' => $epic1,
                'sprint' => $sprint2,
                'estimate_minutes' => 180,
                'time_spent_minutes' => 180,
                'description' => "### Changes\n- Use `FormComponents` for input fields (`TextInput`, `Select`, `Toggle`).\n- Keep `Schemas\\Components` for layout containers (`Section`, `Grid`).\n- Verify all 10 resources load without PHP Fatal Error.",
                'labels' => [$labels['Frontend']->id, $labels['Backend']->id],
            ],
            [
                'task_number' => 'TASK-7',
                'title' => 'Configure Docker Compose setup for Redis & Laravel Reverb WebSockets',
                'type' => 'task',
                'status_slug' => 'deploying',
                'priority' => 'high',
                'assignee' => $devopsUser,
                'reporter' => $dev1User,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 240,
                'time_spent_minutes' => 210,
                'description' => "### Infrastructure Specs\n- Setup Redis 7 container with queue worker service.\n- Configure Laravel Reverb WebSocket server on port 8080 for real-time Kanban updates.",
                'labels' => [$labels['DevOps']->id],
            ],
            [
                'task_number' => 'TASK-8',
                'title' => 'Refinement: Define OpenAPI specification for Task CRUD API',
                'type' => 'story',
                'status_slug' => 'refinement',
                'priority' => 'medium',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 120,
                'time_spent_minutes' => 30,
                'description' => "### Objective\nGenerate OpenAPI 3.0 spec via `dedoc/scramble` to automatically generate TypeScript definitions into `packages/api-types`.",
                'labels' => [$labels['API']->id],
            ],
            [
                'task_number' => 'TASK-9',
                'title' => 'Design Notion/Linear style UI layout with Geist typography',
                'type' => 'story',
                'status_slug' => 'ready',
                'priority' => 'high',
                'assignee' => $dev2User,
                'reporter' => $pmUser,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 300,
                'time_spent_minutes' => 0,
                'description' => "### Design Dials\n- DESIGN_VARIANCE: 6\n- MOTION_INTENSITY: 4\n- VISUAL_DENSITY: 7\n- Single Accent Color (Electric Indigo `#6366f1`).",
                'labels' => [$labels['Frontend']->id],
            ],
            [
                'task_number' => 'TASK-10',
                'title' => 'Blocked: Third-party SMS Gateway API key approval for 2FA',
                'type' => 'bug',
                'status_slug' => 'blocked',
                'priority' => 'urgent',
                'assignee' => $devopsUser,
                'reporter' => $qaUser,
                'epic' => $epic1,
                'sprint' => $sprint2,
                'estimate_minutes' => 180,
                'time_spent_minutes' => 60,
                'description' => "### Blocked Reason\nWaiting for telecom provider to verify business registration documents for SMS OTP brandname registration.",
                'labels' => [$labels['Security']->id, $labels['Bug']->id],
            ],
            [
                'task_number' => 'TASK-11',
                'title' => 'Write unit tests for WorkflowTransitionService state machine',
                'type' => 'subtask',
                'status_slug' => 'in_progress',
                'priority' => 'medium',
                'assignee' => $dev1User,
                'reporter' => $dev1User,
                'epic' => $epic2,
                'sprint' => $sprint2,
                'estimate_minutes' => 120,
                'time_spent_minutes' => 60,
                'description' => "### Subtask of TASK-4\n- Test transition from `To Do` -> `In Progress` (Passes).\n- Test transition from `Backlog` -> `Done` (Fails with InvalidTransitionException).",
                'labels' => [$labels['Backend']->id],
            ],
            [
                'task_number' => 'TASK-12',
                'title' => 'Export Sprint Analytics & Velocity Report to PDF/Excel',
                'type' => 'task',
                'status_slug' => 'backlog',
                'priority' => 'low',
                'assignee' => null,
                'reporter' => $pmUser,
                'epic' => null,
                'sprint' => $sprint3,
                'estimate_minutes' => 360,
                'time_spent_minutes' => 0,
                'description' => "### Feature Scope\nCalculate team velocity, burndown chart data, and export summary report in PDF/Excel formats.",
                'labels' => [$labels['API']->id],
            ],
            [
                'task_number' => 'TASK-13',
                'title' => 'Deprecate legacy API v0 endpoints',
                'type' => 'task',
                'status_slug' => 'cancelled',
                'priority' => 'low',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => null,
                'sprint' => null,
                'estimate_minutes' => 60,
                'time_spent_minutes' => 30,
                'description' => "### Closed / Won't Do\nLegacy v0 API is no longer deployed in staging.",
                'labels' => [$labels['Backend']->id],
            ],
        ];

        $createdTasks = [];
        foreach ($tasksData as $t) {
            $status = $statuses[$t['status_slug']];
            $task = Task::firstOrCreate(
                ['project_id' => $project1->id, 'task_number' => $t['task_number']],
                [
                    'title' => $t['title'],
                    'description' => $t['description'],
                    'type' => $t['type'],
                    'status_id' => $status->id,
                    'priority' => $t['priority'],
                    'assignee_id' => $t['assignee']?->id,
                    'reporter_id' => $t['reporter']->id,
                    'epic_id' => $t['epic']?->id,
                    'sprint_id' => $t['sprint']?->id,
                    'due_date' => now()->addDays(rand(1, 14)),
                    'estimate_minutes' => $t['estimate_minutes'],
                    'time_spent_minutes' => $t['time_spent_minutes'],
                    'labels' => $t['labels'],
                    'order' => rand(1, 10),
                ]
            );
            $createdTasks[$t['task_number']] = $task;
        }

        // Seed tasks for CORE-ENG Project
        $coreEngTasks = [
            [
                'task_number' => 'CORE-ENG-101',
                'title' => 'Thiết kế Schema Multi-tenant & Workspaces',
                'type' => 'story',
                'status_slug' => 'done',
                'priority' => 'high',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic4,
                'sprint' => $sprint24,
                'estimate_minutes' => 480,
                'time_spent_minutes' => 480,
                'description' => 'Hoàn thiện kiến trúc cơ sở dữ liệu PostgreSQL đa người dùng và RBAC.',
            ],
            [
                'task_number' => 'CORE-ENG-102',
                'title' => 'Tích hợp Auth Sanctum & LDAP SSO Provider',
                'type' => 'task',
                'status_slug' => 'in_progress',
                'priority' => 'urgent',
                'assignee' => $dev1User,
                'reporter' => $pmUser,
                'epic' => $epic4,
                'sprint' => $sprint24,
                'estimate_minutes' => 360,
                'time_spent_minutes' => 180,
                'description' => 'Xác thực tài khoản qua chuẩn Sanctum Bearer Token và đồng bộ LDAP Active Directory.',
            ],
            [
                'task_number' => 'CORE-ENG-103',
                'title' => 'Bảng Kanban Ant Design & Task Detail Modal 1000px',
                'type' => 'story',
                'status_slug' => 'testing',
                'priority' => 'high',
                'assignee' => $dev2User,
                'reporter' => $qaUser,
                'epic' => $epic4,
                'sprint' => $sprint24,
                'estimate_minutes' => 300,
                'time_spent_minutes' => 240,
                'description' => 'Giao diện bảng kéo thả Kanban, lọc đa tiêu chí và modal 1000px chỉnh sửa toàn diện.',
            ],
            [
                'task_number' => 'CORE-ENG-104',
                'title' => 'Quản lý chu kỳ Sprints & Phân rã Backlog',
                'type' => 'task',
                'status_slug' => 'in_progress',
                'priority' => 'medium',
                'assignee' => $dev2User,
                'reporter' => $pmUser,
                'epic' => $epic4,
                'sprint' => $sprint24,
                'estimate_minutes' => 240,
                'time_spent_minutes' => 120,
                'description' => 'Tạo Sprint mới, khởi động Sprint và chuyển giao task giữa các chu kỳ làm việc.',
            ],
            [
                'task_number' => 'CORE-ENG-105',
                'title' => 'Tích hợp Reverb WebSockets & Realtime Activity Stream',
                'type' => 'story',
                'status_slug' => 'ready',
                'priority' => 'high',
                'assignee' => $devopsUser,
                'reporter' => $pmUser,
                'epic' => $epic4,
                'sprint' => $sprint25,
                'estimate_minutes' => 360,
                'time_spent_minutes' => 0,
                'description' => 'Broadcasting sự kiện thời gian thực khi task thay đổi trạng thái hoặc có comment mới.',
            ],
            [
                'task_number' => 'CORE-ENG-106',
                'title' => 'Xuất báo cáo tiến độ Sprint sang PDF & Excel',
                'type' => 'task',
                'status_slug' => 'backlog',
                'priority' => 'low',
                'assignee' => null,
                'reporter' => $pmUser,
                'epic' => null,
                'sprint' => null,
                'estimate_minutes' => 180,
                'time_spent_minutes' => 0,
                'description' => 'Báo cáo tổng hợp khối lượng công việc theo nhân sự và tỷ lệ hoàn thành.',
            ],
        ];

        foreach ($coreEngTasks as $ct) {
            $status = $statuses[$ct['status_slug']];
            Task::firstOrCreate(
                ['project_id' => $project3->id, 'task_number' => $ct['task_number']],
                [
                    'title' => $ct['title'],
                    'description' => $ct['description'],
                    'type' => $ct['type'],
                    'status_id' => $status->id,
                    'priority' => $ct['priority'],
                    'assignee_id' => $ct['assignee']?->id,
                    'reporter_id' => $ct['reporter']->id,
                    'epic_id' => $ct['epic']?->id,
                    'sprint_id' => $ct['sprint']?->id,
                    'due_date' => now()->addDays(rand(2, 14)),
                    'estimate_minutes' => $ct['estimate_minutes'],
                    'time_spent_minutes' => $ct['time_spent_minutes'],
                    'order' => rand(1, 10),
                ]
            );
        }

        // Link Subtask TASK-11 to Parent TASK-4
        if (isset($createdTasks['TASK-11']) && isset($createdTasks['TASK-4'])) {
            $createdTasks['TASK-11']->parent_task_id = $createdTasks['TASK-4']->id;
            $createdTasks['TASK-11']->save();
        }

        // 10. Audit Activity Logs (Simulating Real Inter-record Workflows)
        $activities = [
            [
                'task' => $createdTasks['TASK-1'],
                'causer' => $dev1User,
                'description' => 'updated status from In Progress to Done',
                'properties' => ['old' => 'in_progress', 'new' => 'done'],
                'created_at' => now()->subDays(3),
            ],
            [
                'task' => $createdTasks['TASK-3'],
                'causer' => $qaUser,
                'description' => 'filed bug report & set priority to Urgent',
                'properties' => ['priority' => 'urgent', 'reporter' => 'Le Van C'],
                'created_at' => now()->subDays(2),
            ],
            [
                'task' => $createdTasks['TASK-3'],
                'causer' => $dev1User,
                'description' => 'moved task to Code Review and linked PR #42',
                'properties' => ['status' => 'code_review', 'pr' => '#42'],
                'created_at' => now()->subHours(5),
            ],
            [
                'task' => $createdTasks['TASK-5'],
                'causer' => $dev2User,
                'description' => 'moved task to QA / Testing for drag-drop verification',
                'properties' => ['status' => 'testing', 'assignee' => 'Tran Thi B'],
                'created_at' => now()->subHours(2),
            ],
            [
                'task' => $createdTasks['TASK-10'],
                'causer' => $devopsUser,
                'description' => 'flagged task as Blocked due to SMS gateway API key delay',
                'properties' => ['status' => 'blocked', 'reason' => 'SMS OTP API Key Pending'],
                'created_at' => now()->subHours(1),
            ],
        ];

        foreach ($activities as $act) {
            activity('task_workflow')
                ->performedOn($act['task'])
                ->causedBy($act['causer'])
                ->withProperties($act['properties'])
                ->createdAt($act['created_at'])
                ->log($act['description']);
        }

        // 11. Seed Brain Notes, Comments, Work Logs, Attachments for Tasks
        if (isset($createdTasks['TASK-3'])) {
            $task3 = $createdTasks['TASK-3'];
            $task3->update([
                'brain_notes' => '<h3>Technical Analysis</h3><ul><li>Bug occurs when redis connection times out during auth check.</li><li>Solution: Implement retry loop & fallback token verification.</li></ul>',
            ]);

            TaskComment::create([
                'task_id' => $task3->id,
                'user_id' => $qaUser->id,
                'body' => '<p>Reproduction steps confirmed on Chrome & Safari iOS. Escalated to Urgent.</p>',
            ]);

            TaskComment::create([
                'task_id' => $task3->id,
                'user_id' => $dev1User->id,
                'body' => '<p>PR #42 opened with fix. Added retry logic and unit test coverage.</p>',
            ]);

            TaskWorkLog::create([
                'task_id' => $task3->id,
                'user_id' => $dev1User->id,
                'action' => 'Bug Investigation & Hotfix',
                'minutes_logged' => 120,
                'note' => 'Identified root cause in Redis token pool management.',
                'logged_at' => now()->subHours(4),
            ]);

            $mediaLog = \App\Models\Media::create([
                'filename' => 'error_trace_auth.log',
                'disk' => 'public',
                'path' => 'task-attachments/error_trace_auth.log',
                'mime_type' => 'text/plain',
                'type' => 'document',
                'caption' => 'Server error stack trace during OAuth handshake failure',
                'size_bytes' => 1450,
                'user_id' => $qaUser->id,
            ]);

            TaskAttachment::create([
                'task_id' => $task3->id,
                'media_id' => $mediaLog->id,
                'user_id' => $qaUser->id,
                'filename' => 'error_trace_auth.log',
                'disk' => 'public',
                'path' => 'task-attachments/error_trace_auth.log',
                'mime_type' => 'text/plain',
                'size_bytes' => 1450,
            ]);

            // Additional media for Central Media Library across all types
            \App\Models\Media::create([
                'filename' => 'system_architecture_2026.png',
                'disk' => 'public',
                'path' => 'media-library/system_architecture_2026.png',
                'mime_type' => 'image/png',
                'type' => 'image',
                'caption' => 'High level architecture diagram of API Gateway & Microservices',
                'size_bytes' => 524288,
                'user_id' => $adminUser->id,
            ]);

            \App\Models\Media::create([
                'filename' => 'demo_workflow_walkthrough.mp4',
                'disk' => 'public',
                'path' => 'media-library/demo_workflow_walkthrough.mp4',
                'mime_type' => 'video/mp4',
                'type' => 'video',
                'caption' => 'Screen recording of Agile Sprint Planning & Board Drag and Drop',
                'size_bytes' => 15728640,
                'user_id' => $pmUser->id,
            ]);

            \App\Models\Media::create([
                'filename' => 'sprint_standup_notes.m4a',
                'disk' => 'public',
                'path' => 'media-library/sprint_standup_notes.m4a',
                'mime_type' => 'audio/m4a',
                'type' => 'audio',
                'caption' => 'Daily standup recording for Sprint 42 kickoff',
                'size_bytes' => 3145728,
                'user_id' => $pmUser->id,
            ]);

            \App\Models\Media::create([
                'filename' => 'release_v2.4_assets.zip',
                'disk' => 'public',
                'path' => 'media-library/release_v2.4_assets.zip',
                'mime_type' => 'application/zip',
                'type' => 'archive',
                'caption' => 'Compiled frontend assets & SSL certificates bundle',
                'size_bytes' => 8388608,
                'user_id' => $devopsUser->id,
            ]);
        }

        if (isset($createdTasks['TASK-5'])) {
            $task5 = $createdTasks['TASK-5'];
            $task5->update([
                'brain_notes' => '<h3>UI/UX Design Spec</h3><p>Board columns must support HTML5 drag-and-drop with smooth animation using Motion library.</p>',
            ]);

            TaskComment::create([
                'task_id' => $task5->id,
                'user_id' => $dev2User->id,
                'body' => '<p>Board component created using Tailwind v4 grid layout and smooth spring animations.</p>',
            ]);

            TaskWorkLog::create([
                'task_id' => $task5->id,
                'user_id' => $dev2User->id,
                'action' => 'Frontend Component Development',
                'minutes_logged' => 240,
                'note' => 'Built drag and drop column reordering with optimistic UI updates.',
                'logged_at' => now()->subHours(2),
            ]);
        }
    }
}
