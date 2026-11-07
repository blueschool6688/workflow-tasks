<?php

namespace Tests\Feature;

use App\Events\TaskChanged;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Laravel\Passport\Passport;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AccessAndRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $lead;
    private User $outsider;
    private Project $project;
    private Project $otherProject;
    private WorkflowStatus $todo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->lead = User::factory()->create();
        $this->outsider = User::factory()->create();

        $org = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $workspace = Workspace::create(['organization_id' => $org->id, 'name' => 'WS', 'slug' => 'ws']);
        $otherWorkspace = Workspace::create(['organization_id' => $org->id, 'name' => 'Other', 'slug' => 'other']);
        $workspace->members()->attach($this->lead->id, ['role' => 'owner']);
        $otherWorkspace->members()->attach($this->outsider->id, ['role' => 'owner']);

        $workflow = Workflow::create(['workspace_id' => $workspace->id, 'name' => 'Flow']);
        $this->todo = $workflow->statuses()->create(['name' => 'To Do', 'category' => 'todo', 'order' => 1]);
        $workflow->statuses()->create(['name' => 'Done', 'category' => 'done', 'order' => 2]);

        $this->project = Project::create([
            'workspace_id' => $workspace->id, 'name' => 'Alpha', 'key' => 'ALPHA',
            'type' => 'scrum', 'workflow_id' => $workflow->id, 'lead_id' => $this->lead->id,
        ]);
        $this->project->members()->attach($this->lead->id, ['role_in_project' => 'lead']);

        $this->otherProject = Project::create([
            'workspace_id' => $otherWorkspace->id, 'name' => 'Beta', 'key' => 'BETA',
            'type' => 'scrum', 'lead_id' => $this->outsider->id,
        ]);
        $this->otherProject->members()->attach($this->outsider->id, ['role_in_project' => 'lead']);
    }

    private function makeTask(array $attrs = []): Task
    {
        static $n = 0;
        $n++;

        return Task::create($attrs + [
            'project_id' => $this->project->id, 'task_number' => "ALPHA-{$n}", 'title' => "Task {$n}",
            'status_id' => $this->todo->id, 'reporter_id' => $this->lead->id,
        ]);
    }

    public function test_outsider_cannot_read_or_edit_another_project(): void
    {
        $task = $this->makeTask();
        Passport::actingAs($this->outsider);

        $this->getJson('/api/v1/projects/ALPHA/tasks')->assertForbidden();
        $this->getJson("/api/v1/tasks/{$task->id}")->assertForbidden();
        $this->patchJson("/api/v1/tasks/{$task->id}", ['title' => 'hacked'])->assertForbidden();
        $this->postJson('/api/v1/projects/ALPHA/messages', ['content' => 'hi'])->assertForbidden();
        $this->getJson('/api/v1/projects')->assertOk()->assertJsonMissing(['key' => 'ALPHA']);
    }

    public function test_changing_own_email_to_tasks_local_does_not_grant_admin(): void
    {
        Passport::actingAs($this->outsider);

        $this->patchJson('/api/v1/auth/profile', ['email' => 'me@tasks.local'])->assertOk();

        $this->getJson('/api/v1/projects/ALPHA/tasks')->assertForbidden();
        $this->getJson('/api/v1/activity-logs')->assertForbidden();
    }

    public function test_spatie_admin_sees_every_project(): void
    {
        $this->outsider->assignRole(Role::create(['name' => 'super-admin']));
        Passport::actingAs($this->outsider);

        $this->getJson('/api/v1/projects/ALPHA/tasks')->assertOk();
    }

    public function test_task_numbers_stay_unique_past_ten_tasks(): void
    {
        Passport::actingAs($this->lead);

        for ($i = 1; $i <= 11; $i++) {
            $this->postJson('/api/v1/projects/ALPHA/tasks', ['title' => "T{$i}"])
                ->assertCreated()
                ->assertJsonPath('data.task_number', "ALPHA-{$i}");
        }
    }

    public function test_urgent_priority_is_accepted(): void
    {
        Passport::actingAs($this->lead);

        $this->postJson('/api/v1/projects/ALPHA/tasks', ['title' => 'Hot', 'priority' => 'urgent'])->assertCreated();
    }

    public function test_task_cannot_be_moved_into_another_projects_sprint(): void
    {
        $task = $this->makeTask();
        $foreignSprint = Sprint::create(['project_id' => $this->otherProject->id, 'name' => 'S1', 'status' => 'future']);
        Passport::actingAs($this->lead);

        $this->patchJson("/api/v1/tasks/{$task->id}", ['sprint_id' => $foreignSprint->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('sprint_id');
    }

    public function test_child_routes_reject_records_of_another_project(): void
    {
        $foreignSprint = Sprint::create(['project_id' => $this->otherProject->id, 'name' => 'S1', 'status' => 'future']);
        Passport::actingAs($this->lead);

        $this->deleteJson("/api/v1/projects/ALPHA/sprints/{$foreignSprint->id}")->assertNotFound();
        $this->assertDatabaseHas('sprints', ['id' => $foreignSprint->id]);
    }

    public function test_bare_number_does_not_resolve_to_a_random_task(): void
    {
        $this->makeTask(['task_number' => 'ALPHA-11']);
        Passport::actingAs($this->lead);

        $this->getJson('/api/v1/tasks/1')->assertNotFound();
    }

    public function test_work_log_is_saved_with_its_description(): void
    {
        $task = $this->makeTask();
        Passport::actingAs($this->lead);

        $this->postJson("/api/v1/tasks/{$task->id}/worklogs", ['minutes_logged' => 30, 'description' => 'pairing'])
            ->assertCreated()
            ->assertJsonPath('data.description', 'pairing');

        $this->assertSame(30, $task->fresh()->time_spent_minutes);
    }

    public function test_file_upload_and_attach_to_task(): void
    {
        Storage::fake('public');
        $task = $this->makeTask();
        Passport::actingAs($this->lead);

        $mediaId = $this->postJson('/api/v1/media', ['file' => UploadedFile::fake()->image('shot.png')])
            ->assertCreated()
            ->json('data.id');

        $this->postJson("/api/v1/tasks/{$task->id}/attachments", ['media_id' => $mediaId])->assertCreated();
        $this->assertDatabaseHas('task_attachments', ['task_id' => $task->id, 'media_id' => $mediaId]);
    }

    public function test_script_capable_uploads_are_rejected(): void
    {
        Storage::fake('public');
        Passport::actingAs($this->lead);

        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg onload="alert(1)"/>');
        $this->postJson('/api/v1/media', ['file' => $svg])->assertUnprocessable();
        $this->postJson('/api/v1/projects/ALPHA/messages/upload', ['file' => $svg])->assertUnprocessable();
    }

    public function test_epic_can_be_created(): void
    {
        Passport::actingAs($this->lead);

        $this->postJson('/api/v1/projects/ALPHA/epics', ['title' => 'Checkout', 'description' => 'v2'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Checkout');
    }

    public function test_calendar_includes_tasks_due_later_on_the_last_day(): void
    {
        $this->makeTask(['assignee_id' => $this->lead->id, 'due_date' => '2026-03-31 15:00:00']);
        Passport::actingAs($this->lead);

        $this->getJson('/api/v1/dashboard/calendar?from=2026-03-01&to=2026-03-31')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_last_workflow_status_cannot_be_deleted(): void
    {
        Passport::actingAs($this->lead);
        $done = WorkflowStatus::where('name', 'Done')->first();

        $this->deleteJson("/api/v1/projects/ALPHA/workflow/statuses/{$done->id}")->assertOk();
        $this->deleteJson("/api/v1/projects/ALPHA/workflow/statuses/{$this->todo->id}")->assertStatus(422);
    }

    public function test_only_one_sprint_can_be_active(): void
    {
        $s1 = Sprint::create(['project_id' => $this->project->id, 'name' => 'S1', 'status' => 'future']);
        $s2 = Sprint::create(['project_id' => $this->project->id, 'name' => 'S2', 'status' => 'future']);
        Passport::actingAs($this->lead);

        $this->postJson("/api/v1/projects/ALPHA/sprints/{$s1->id}/start")->assertOk()->assertJsonPath('data.status', 'active');
        $this->postJson("/api/v1/projects/ALPHA/sprints/{$s2->id}/start")->assertStatus(422);
    }

    public function test_completing_a_sprint_moves_unfinished_tasks(): void
    {
        $done = WorkflowStatus::where('name', 'Done')->first();
        $active = Sprint::create(['project_id' => $this->project->id, 'name' => 'S1', 'status' => 'active']);
        $next = Sprint::create(['project_id' => $this->project->id, 'name' => 'S2', 'status' => 'future']);
        $open = $this->makeTask(['sprint_id' => $active->id]);
        $finished = $this->makeTask(['sprint_id' => $active->id, 'status_id' => $done->id]);
        Passport::actingAs($this->lead);

        $this->postJson("/api/v1/projects/ALPHA/sprints/{$active->id}/complete", ['move_to' => $next->id])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('moved_count', 1);

        $this->assertSame($next->id, $open->fresh()->sprint_id);
        $this->assertSame($active->id, $finished->fresh()->sprint_id);
    }

    public function test_completing_without_target_returns_tasks_to_backlog(): void
    {
        $active = Sprint::create(['project_id' => $this->project->id, 'name' => 'S1', 'status' => 'active']);
        $open = $this->makeTask(['sprint_id' => $active->id]);
        Passport::actingAs($this->lead);

        $this->postJson("/api/v1/projects/ALPHA/sprints/{$active->id}/complete")->assertOk();

        $this->assertNull($open->fresh()->sprint_id);
    }

    public function test_task_changes_are_broadcast_to_the_project_channel(): void
    {
        Event::fake([TaskChanged::class]);
        Passport::actingAs($this->lead);

        $id = $this->postJson('/api/v1/projects/ALPHA/tasks', ['title' => 'Live'])->assertCreated()->json('data.id');
        $this->patchJson("/api/v1/tasks/{$id}", ['title' => 'Live 2'])->assertOk();

        Event::assertDispatched(TaskChanged::class, fn (TaskChanged $e) => $e->action === 'created'
            && $e->taskId === $id
            && $e->actorId === $this->lead->id
            && in_array('private-project.ALPHA', array_map(fn ($c) => $c->name, $e->broadcastOn())));
        Event::assertDispatched(TaskChanged::class, fn (TaskChanged $e) => $e->action === 'updated');
    }

    public function test_lead_manages_members_only_from_the_project_workspace(): void
    {
        $colleague = User::factory()->create();
        $this->project->workspace->members()->attach($colleague->id, ['role' => 'member']);
        Passport::actingAs($this->lead);

        $this->getJson('/api/v1/projects/ALPHA/members')
            ->assertOk()
            ->assertJsonPath('can_manage', true)
            ->assertJsonPath('candidates.0.id', $colleague->id)
            ->assertJsonMissing(['email' => $this->outsider->email]);

        $this->postJson('/api/v1/projects/ALPHA/members', ['user_id' => $colleague->id, 'role_in_project' => 'manager'])->assertOk();
        $this->postJson('/api/v1/projects/ALPHA/members', ['user_id' => $this->outsider->id, 'role_in_project' => 'developer'])
            ->assertJsonValidationErrors('user_id');
        $this->deleteJson("/api/v1/projects/ALPHA/members/{$this->lead->id}")->assertStatus(422);
        $this->deleteJson("/api/v1/projects/ALPHA/members/{$colleague->id}")->assertOk();
    }

    public function test_freeform_project_can_be_created(): void
    {
        Passport::actingAs($this->lead);

        $this->postJson('/api/v1/projects', ['name' => 'Free', 'key' => 'FREE', 'type' => 'freeform'])->assertCreated();
    }

    public function test_unknown_sort_column_is_a_validation_error(): void
    {
        Passport::actingAs($this->lead);

        $this->getJson('/api/v1/projects?sort=password')->assertUnprocessable();
    }
}
