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

        $clientRepo = app(\Laravel\Passport\ClientRepository::class);
        $clientRepo->createPersonalAccessGrantClient('Tasks Test Personal Access Client', 'users');
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

    public function test_admin_can_access_project_chat_messages_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/project-chat-messages');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_notifications_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/notifications');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_task_comments_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/task-comments');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_task_work_logs_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/task-work-logs');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_oauth_tokens_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/o-auth-tokens');
        $response->assertStatus(200);
    }

    public function test_admin_can_access_oauth_clients_resource(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();

        $response = $this->actingAs($admin)->get('/admin/o-auth-clients');
        $response->assertStatus(200);
    }

    public function test_admin_can_revoke_and_restore_oauth_token(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();
        $tokenResult = $admin->createToken('Test Token for Admin', ['read:profile', 'read:tasks']);
        $tokenId = $tokenResult->token->id;

        $tokenModel = \App\Models\OAuthToken::find($tokenId);
        $this->assertNotNull($tokenModel);
        $this->assertFalse($tokenModel->revoked);

        // Revoke token
        $tokenModel->revoked = true;
        $tokenModel->save();
        $this->assertTrue($tokenModel->fresh()->revoked);

        // Restore token
        $tokenModel->revoked = false;
        $tokenModel->save();
        $this->assertFalse($tokenModel->fresh()->revoked);
    }

    public function test_user_personal_access_token_creation_with_scopes(): void
    {
        $admin = User::where('email', 'admin@tasks.local')->first();
        $tokenResult = $admin->createToken('Scoped Token', ['read:profile', 'read:tasks', 'write:tasks']);

        $token = $tokenResult->token;
        $this->assertContains('read:profile', $token->scopes);
        $this->assertContains('read:tasks', $token->scopes);
        $this->assertContains('write:tasks', $token->scopes);
    }
}
