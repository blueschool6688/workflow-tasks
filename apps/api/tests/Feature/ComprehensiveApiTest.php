<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ComprehensiveApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Project $project;
    protected Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->user = User::where('email', 'admin@tasks.local')->first() ?? User::factory()->create();
        $this->project = Project::where('key', 'CORE-ENG')->first() ?? Project::first();
        $this->workspace = $this->project->workspace ?? Workspace::first();

        $this->user->current_workspace_id = $this->workspace->id;
        $this->user->save();

        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_auth_me_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(200);
        $response->assertJsonStructure(['user' => ['id', 'email', 'name']]);
    }

    public function test_dashboard_endpoints(): void
    {
        $this->getJson('/api/v1/dashboard/stats')->assertStatus(200);
        $this->getJson('/api/v1/dashboard/my-work')->assertStatus(200);
        $this->getJson('/api/v1/dashboard/summary')->assertStatus(200);
        $this->getJson('/api/v1/dashboard/calendar')->assertStatus(200);
    }

    public function test_projects_list_and_details(): void
    {
        $response = $this->getJson('/api/v1/projects');
        $response->assertStatus(200);

        // Test with key "CORE-ENG"
        $this->getJson("/api/v1/projects/CORE-ENG")->assertStatus(200);

        // Test with lowercase key "core-eng"
        $this->getJson("/api/v1/projects/core-eng")->assertStatus(200);

        // Test with UUID
        $this->getJson("/api/v1/projects/{$this->project->id}")->assertStatus(200);
    }

    public function test_project_tasks_and_sprints_by_key(): void
    {
        $tasksRes = $this->getJson('/api/v1/projects/core-eng/tasks');
        $tasksRes->assertStatus(200);

        $sprintsRes = $this->getJson('/api/v1/projects/core-eng/sprints');
        $sprintsRes->assertStatus(200);

        $boardRes = $this->getJson('/api/v1/projects/core-eng/board');
        $boardRes->assertStatus(200);

        $summaryRes = $this->getJson('/api/v1/projects/core-eng/summary');
        $summaryRes->assertStatus(200);
    }

    public function test_task_crud_and_route_binding_by_task_number(): void
    {
        $task = Task::where('project_id', $this->project->id)->first();
        if ($task) {
            // By task_number
            $this->getJson("/api/v1/tasks/{$task->task_number}")->assertStatus(200);

            // By UUID
            $this->getJson("/api/v1/tasks/{$task->id}")->assertStatus(200);

            // Comments
            $this->getJson("/api/v1/tasks/{$task->task_number}/comments")->assertStatus(200);

            // Activity
            $this->getJson("/api/v1/tasks/{$task->task_number}/activity")->assertStatus(200);

            // Post Comment
            $commentRes = $this->postJson("/api/v1/tasks/{$task->task_number}/comments", [
                'content' => 'Automated test comment verification',
            ]);
            $commentRes->assertStatus(201);
        }
    }

    public function test_create_task_under_project(): void
    {
        $res = $this->postJson('/api/v1/projects/core-eng/tasks', [
            'title' => 'Test Task via API Verification',
            'type' => 'task',
            'priority' => 'high',
            'description' => 'Automated test task creation verification.',
        ]);

        $res->assertStatus(201);
        $res->assertJsonStructure(['data' => ['id', 'task_number', 'title']]);
    }

    public function test_board_and_tasks_with_non_uuid_sprint_slugs(): void
    {
        // 1. Non-UUID sprint slug like "sprint-24" should return 200 OK without Postgres 22P02 error
        $boardSlugRes = $this->getJson('/api/v1/projects/core-eng/board?sprint_id=sprint-24');
        $boardSlugRes->assertStatus(200);

        // 2. Backlog filter
        $boardBacklogRes = $this->getJson('/api/v1/projects/core-eng/board?sprint_id=backlog');
        $boardBacklogRes->assertStatus(200);

        // 3. Tasks index with sprint slug
        $tasksSlugRes = $this->getJson('/api/v1/projects/core-eng/tasks?sprint_id=sprint-24');
        $tasksSlugRes->assertStatus(200);

        // 4. Tasks index with backlog
        $tasksBacklogRes = $this->getJson('/api/v1/projects/core-eng/tasks?sprint_id=backlog');
        $tasksBacklogRes->assertStatus(200);
    }

    public function test_non_existent_task_returns_404(): void
    {
        $res = $this->getJson('/api/v1/tasks/NON-EXISTENT-TASK-999');
        $res->assertStatus(404);
    }

    public function test_update_profile_and_change_password_endpoints(): void
    {
        // 1. Update Profile
        $profileRes = $this->patchJson('/api/v1/auth/profile', [
            'name' => 'Admin Updated Name',
            'username' => 'admin_updated',
            'email' => 'admin_updated@tasks.local',
        ]);

        $profileRes->assertStatus(200)
            ->assertJsonPath('user.name', 'Admin Updated Name')
            ->assertJsonPath('user.username', 'admin_updated')
            ->assertJsonPath('user.email', 'admin_updated@tasks.local');

        $this->user->refresh();
        $this->assertEquals('Admin Updated Name', $this->user->name);
        $this->assertEquals('admin_updated', $this->user->username);

        // 2. Change Password validation error (wrong current password)
        $wrongPassRes = $this->putJson('/api/v1/auth/password', [
            'current_password' => 'wrongpassword123',
            'password' => 'newpassword1234',
            'password_confirmation' => 'newpassword1234',
        ]);
        $wrongPassRes->assertStatus(422);

        // 3. Change Password success
        $changePassRes = $this->putJson('/api/v1/auth/password', [
            'current_password' => 'password',
            'password' => 'newpassword1234',
            'password_confirmation' => 'newpassword1234',
        ]);
        $changePassRes->assertStatus(200);
    }
}
