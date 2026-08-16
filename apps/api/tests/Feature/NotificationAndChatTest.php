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

    public function test_user_can_upload_chat_attachment(): void
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        \Illuminate\Support\Facades\Storage::fake('public');

        $file = \Illuminate\Http\UploadedFile::fake()->image('screenshot.png');

        $response = $this->postJson("/api/v1/projects/{$this->project->id}/messages/upload", [
            'file' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['name', 'url', 'size', 'type', 'mime_type']])
            ->assertJsonPath('data.name', 'screenshot.png')
            ->assertJsonPath('data.type', 'image');
    }
}
