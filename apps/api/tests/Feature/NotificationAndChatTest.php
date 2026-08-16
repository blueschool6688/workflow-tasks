<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\Task;
use App\Models\User;
use App\Models\WorkflowStatus;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationAndChatTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $assigneeUser;
    protected User $reporterUser;
    protected Project $project;
    protected Workspace $workspace;
    protected WorkflowStatus $todoStatus;
    protected WorkflowStatus $doneStatus;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->adminUser = User::where('email', 'admin@tasks.local')->first() ?? User::factory()->create(['name' => 'Admin User']);
        $this->assigneeUser = User::where('email', '!=', 'admin@tasks.local')->first() ?? User::factory()->create(['name' => 'Assignee User']);
        $this->reporterUser = User::factory()->create(['name' => 'Reporter User']);

        $this->project = Project::where('key', 'CORE-ENG')->first() ?? Project::first();
        $this->workspace = $this->project->workspace ?? Workspace::first();

        $this->todoStatus = WorkflowStatus::where('name', 'To Do')->first() ?? WorkflowStatus::first();
        $this->doneStatus = WorkflowStatus::where('name', 'Done')->first() ?? WorkflowStatus::where('id', '!=', $this->todoStatus->id)->first();
    }

    public function test_task_status_change_creates_notifications_for_assignee_and_reporter(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        $task = Task::create([
            'project_id' => $this->project->id,
            'task_number' => 'TEST-1',
            'title' => 'Test Task Notification',
            'status_id' => $this->todoStatus->id,
            'assignee_id' => $this->assigneeUser->id,
            'reporter_id' => $this->reporterUser->id,
            'priority' => 'high',
        ]);

        // Change status via updateStatus endpoint
        $response = $this->patchJson("/api/v1/tasks/{$task->id}/status", [
            'status_id' => $this->doneStatus->id,
        ]);

        $response->assertStatus(200);

        // Verify notification created for Assignee
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->assigneeUser->id,
            'task_id' => $task->id,
            'type' => 'task_status_changed',
        ]);

        // Verify notification created for Reporter
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->reporterUser->id,
            'task_id' => $task->id,
            'type' => 'task_status_changed',
        ]);

        // Verify actor (adminUser) does not receive self-notification
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $this->adminUser->id,
            'task_id' => $task->id,
            'sender_id' => $this->adminUser->id,
        ]);
    }

    public function test_user_can_list_notifications_and_get_unread_count(): void
    {
        Sanctum::actingAs($this->assigneeUser, ['*']);

        Notification::create([
            'user_id' => $this->assigneeUser->id,
            'sender_id' => $this->adminUser->id,
            'project_id' => $this->project->id,
            'type' => 'task_status_changed',
            'title' => 'Cập nhật trạng thái TEST-1',
            'message' => 'Admin đã chuyển trạng thái từ To Do sang Done',
            'is_read' => false,
        ]);

        $listRes = $this->getJson('/api/v1/notifications');
        $listRes->assertStatus(200)
            ->assertJsonStructure(['data', 'unread_count'])
            ->assertJsonPath('unread_count', 1);

        $countRes = $this->getJson('/api/v1/notifications/unread-count');
        $countRes->assertStatus(200)
            ->assertJson(['unread_count' => 1]);
    }

    public function test_user_can_mark_notification_as_read_and_delete(): void
    {
        Sanctum::actingAs($this->assigneeUser, ['*']);

        $notification = Notification::create([
            'user_id' => $this->assigneeUser->id,
            'sender_id' => $this->adminUser->id,
            'project_id' => $this->project->id,
            'type' => 'task_status_changed',
            'title' => 'Test Notification',
            'message' => 'Test message',
            'is_read' => false,
        ]);

        // Mark as read
        $readRes = $this->patchJson("/api/v1/notifications/{$notification->id}/read");
        $readRes->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $this->assertTrue($notification->fresh()->is_read);

        // Delete notification
        $deleteRes = $this->deleteJson("/api/v1/notifications/{$notification->id}");
        $deleteRes->assertStatus(200);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        Sanctum::actingAs($this->assigneeUser, ['*']);

        Notification::create([
            'user_id' => $this->assigneeUser->id,
            'sender_id' => $this->adminUser->id,
            'project_id' => $this->project->id,
            'type' => 'task_status_changed',
            'title' => 'Test 1',
            'message' => 'Message 1',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $this->assigneeUser->id,
            'sender_id' => $this->adminUser->id,
            'project_id' => $this->project->id,
            'type' => 'task_status_changed',
            'title' => 'Test 2',
            'message' => 'Message 2',
            'is_read' => false,
        ]);

        $res = $this->postJson('/api/v1/notifications/read-all');
        $res->assertStatus(200);

        $this->assertEquals(0, Notification::where('user_id', $this->assigneeUser->id)->where('is_read', false)->count());
    }

    public function test_project_team_chat_endpoints(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        // Send a message
        $sendRes = $this->postJson("/api/v1/projects/{$this->project->id}/messages", [
            'content' => 'Chào mọi người, Sprint 1 bắt đầu!',
        ]);

        $sendRes->assertStatus(201)
            ->assertJsonPath('data.content', 'Chào mọi người, Sprint 1 bắt đầu!');

        $messageId = $sendRes->json('data.id');

        // List messages (verifying tasks and pinned_message fields)
        $listRes = $this->getJson("/api/v1/projects/{$this->project->id}/messages");
        $listRes->assertStatus(200)
            ->assertJsonStructure(['data', 'members', 'tasks', 'pinned_message']);

        // Send typing indicator
        $typingRes = $this->postJson("/api/v1/projects/{$this->project->id}/typing", [
            'is_typing' => true,
        ]);
        $typingRes->assertStatus(200);

        // Pin message
        $pinRes = $this->patchJson("/api/v1/projects/{$this->project->id}/messages/{$messageId}/pin");
        $pinRes->assertStatus(200)
            ->assertJsonPath('is_pinned', true);

        $this->assertTrue(ProjectMessage::find($messageId)->is_pinned);

        // Unpin message
        $unpinRes = $this->patchJson("/api/v1/projects/{$this->project->id}/messages/{$messageId}/pin");
        $unpinRes->assertStatus(200)
            ->assertJsonPath('is_pinned', false);

        $this->assertFalse(ProjectMessage::find($messageId)->is_pinned);

        // Delete message
        $deleteRes = $this->deleteJson("/api/v1/projects/{$this->project->id}/messages/{$messageId}");
        $deleteRes->assertStatus(200);

        $this->assertDatabaseMissing('project_messages', ['id' => $messageId]);
    }

    public function test_user_can_send_message_with_only_attachments_and_no_text(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        $response = $this->postJson("/api/v1/projects/{$this->project->id}/messages", [
            'content' => '',
            'attachments' => [
                [
                    'name' => 'photo.png',
                    'url' => 'http://localhost/storage/photo.png',
                    'type' => 'image',
                    'size' => 1024,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('project_messages', [
            'project_id' => $this->project->id,
            'user_id' => $this->adminUser->id,
        ]);
    }

    public function test_task_route_binding_resolves_partial_task_numbers(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        $task = Task::create([
            'project_id' => $this->project->id,
            'task_number' => 'CUSTOM-SLUG-999',
            'title' => 'Sample Multi-hyphen Task',
            'status_id' => $this->todoStatus->id,
            'assignee_id' => $this->adminUser->id,
            'reporter_id' => $this->adminUser->id,
        ]);

        // Exact match
        $res1 = $this->getJson("/api/v1/tasks/CUSTOM-SLUG-999");
        $res1->assertStatus(200)
            ->assertJsonPath('data.id', $task->id);

        // Partial match (e.g. SLUG-999)
        $res2 = $this->getJson("/api/v1/tasks/SLUG-999");
        $res2->assertStatus(200)
            ->assertJsonPath('data.id', $task->id);
    }

    public function test_broadcasting_auth_authenticates_private_channels_with_sanctum(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        // 1. User private channel
        $resUser = $this->post('/api/v1/broadcasting/auth', [
            'channel_name' => 'private-user.' . $this->adminUser->id,
            'socket_id' => '1234.5678',
        ]);
        $resUser->assertStatus(200);

        // 2. Project UUID private channel
        $resProjUuid = $this->post('/api/v1/broadcasting/auth', [
            'channel_name' => 'private-project.' . $this->project->id,
            'socket_id' => '1234.5678',
        ]);
        $resProjUuid->assertStatus(200);

        // 3. Project Key private channel (e.g. CORE-ENG)
        $resProjKey = $this->post('/api/v1/broadcasting/auth', [
            'channel_name' => 'private-project.' . $this->project->key,
            'socket_id' => '1234.5678',
        ]);
        $resProjKey->assertStatus(200);
    }

    public function test_project_message_sent_event_broadcasts_on_both_uuid_and_key_channels(): void
    {
        $message = ProjectMessage::create([
            'project_id' => $this->project->id,
            'user_id' => $this->adminUser->id,
            'content' => 'Test event broadcast',
        ]);

        $event = new \App\Events\ProjectMessageSent($message);
        $channels = $event->broadcastOn();

        $channelNames = array_map(fn ($ch) => $ch->name, $channels);

        $this->assertContains('private-project.' . $this->project->id, $channelNames);
        $this->assertContains('private-project.' . $this->project->key, $channelNames);
    }

    public function test_user_can_send_and_list_messages_using_project_key_slug(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        // Send using key
        $sendRes = $this->postJson("/api/v1/projects/{$this->project->key}/messages", [
            'content' => 'Tin nhắn gửi qua project key slug!',
        ]);

        $sendRes->assertStatus(201)
            ->assertJsonPath('data.content', 'Tin nhắn gửi qua project key slug!');

        // List using key
        $listRes = $this->getJson("/api/v1/projects/{$this->project->key}/messages");
        $listRes->assertStatus(200)
            ->assertJsonStructure(['data', 'members']);

        // Typing using key
        $typingRes = $this->postJson("/api/v1/projects/{$this->project->key}/typing", [
            'is_typing' => true,
        ]);
        $typingRes->assertStatus(200);
    }
}
