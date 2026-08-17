<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\Workflow;
use App\Models\WorkflowStatus;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class WorkflowManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $leadUser;
    protected User $memberUser;
    protected Project $project;
    protected Workspace $workspace;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $clientRepo = app(\Laravel\Passport\ClientRepository::class);
        $clientRepo->createPersonalAccessGrantClient('Tasks Test Personal Access Client', 'users');

        $this->adminUser = User::where('email', 'admin@tasks.local')->first() ?? User::factory()->create();
        $this->leadUser = User::factory()->create(['name' => 'Project Lead']);
        $this->memberUser = User::factory()->create(['name' => 'Regular Member']);

        $this->project = Project::where('key', 'CORE-ENG')->first() ?? Project::first();
        $this->workspace = $this->project->workspace ?? Workspace::first();

        $this->project->lead_id = $this->leadUser->id;
        $this->project->save();

        // Attach regular member
        $this->project->members()->syncWithoutDetaching([
            $this->memberUser->id => ['role_in_project' => 'member'],
            $this->leadUser->id => ['role_in_project' => 'lead'],
        ]);
    }

    public function test_project_workflow_can_be_viewed_by_members(): void
    {
        Passport::actingAs($this->memberUser, ['*']);

        $response = $this->getJson("/api/v1/projects/{$this->project->id}/workflow");
        $response->assertStatus(200)
            ->assertJsonPath('can_manage_workflow', false)
            ->assertJsonStructure(['data' => ['id', 'name', 'statuses']]);
    }

    public function test_project_lead_has_can_manage_workflow_true(): void
    {
        Passport::actingAs($this->leadUser, ['*']);

        $response = $this->getJson("/api/v1/projects/{$this->project->id}/workflow");
        $response->assertStatus(200)
            ->assertJsonPath('can_manage_workflow', true);
    }

    public function test_lead_can_add_workflow_status_to_project(): void
    {
        Passport::actingAs($this->leadUser, ['*']);

        $response = $this->postJson("/api/v1/projects/{$this->project->id}/workflow/statuses", [
            'name' => 'QA Testing',
            'color' => '#f59e0b',
            'category' => 'in_progress',
            'order' => 5,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'QA Testing');

        $this->assertDatabaseHas('workflow_statuses', [
            'name' => 'QA Testing',
            'color' => '#f59e0b',
        ]);
    }

    public function test_regular_member_cannot_add_workflow_status(): void
    {
        Passport::actingAs($this->memberUser, ['*']);

        $response = $this->postJson("/api/v1/projects/{$this->project->id}/workflow/statuses", [
            'name' => 'Unauthorized Status',
            'color' => '#ef4444',
            'category' => 'in_progress',
        ]);

        $response->assertStatus(403);
    }

    public function test_lead_can_create_and_delete_workflow_transition(): void
    {
        Passport::actingAs($this->leadUser, ['*']);

        $workflowRes = $this->getJson("/api/v1/projects/{$this->project->id}/workflow");
        $statuses = $workflowRes->json('data.statuses');
        $this->assertGreaterThanOrEqual(2, count($statuses));

        $fromId = $statuses[0]['id'];
        $toId = $statuses[1]['id'];

        // Create transition
        $transRes = $this->postJson("/api/v1/projects/{$this->project->id}/workflow/transitions", [
            'from_status_id' => $fromId,
            'to_status_id' => $toId,
            'name' => 'Start Development',
        ]);

        $transRes->assertStatus(201)
            ->assertJsonPath('data.name', 'Start Development');

        $transitionId = $transRes->json('data.id');

        // Delete transition
        $delRes = $this->deleteJson("/api/v1/projects/{$this->project->id}/workflow/transitions/{$transitionId}");
        $delRes->assertStatus(200);

        $this->assertDatabaseMissing('workflow_transitions', ['id' => $transitionId]);
    }
}
