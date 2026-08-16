<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\Workspace;
use App\Models\Workflow;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilamentAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_panel_requires_authentication(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/admin/login');
    }

    public function test_authenticated_admin_can_access_dashboard(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_user_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/users');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_organization_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/organizations');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_workspace_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/workspaces');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_workflow_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/workflows');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_project_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/projects');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_task_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/tasks');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_sprint_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/sprints');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_epic_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/epics');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_label_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/labels');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_activity_log_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/activity-logs');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_shield_role_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/shield/roles');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_media_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/media');
        $response->assertStatus(200);
    }
}
