<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\TaskWorkLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_task_has_brain_notes_column(): void
    {
        $task = Task::first();
        $task->update(['brain_notes' => '<p>Acceptance criteria: Must pass 100% tests.</p>']);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'brain_notes' => '<p>Acceptance criteria: Must pass 100% tests.</p>',
        ]);
    }

    public function test_task_can_have_comments(): void
    {
        $task = Task::first();
        $user = User::first();

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'body' => 'Great progress on this feature!',
        ]);

        $this->assertCount(1, $task->comments);
        $this->assertEquals('Great progress on this feature!', $task->comments->first()->body);
    }

    public function test_task_can_have_work_logs(): void
    {
        $task = Task::first();
        $user = User::first();

        $workLog = TaskWorkLog::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'action' => 'Code Review',
            'minutes_logged' => 90,
            'note' => 'Reviewed PR #42',
            'logged_at' => now(),
        ]);

        $this->assertCount(1, $task->workLogs);
        $this->assertEquals(90, $task->workLogs->first()->minutes_logged);
    }

    public function test_task_can_have_subtasks(): void
    {
        $parent = Task::first();
        $user = User::first();

        $subtask = Task::create([
            'project_id' => $parent->project_id,
            'task_number' => $parent->task_number . '-S1',
            'title' => 'Subtask 1',
            'type' => 'subtask',
            'status_id' => $parent->status_id,
            'priority' => 'medium',
            'reporter_id' => $user->id,
            'parent_task_id' => $parent->id,
        ]);

        $this->assertCount(1, $parent->subtasks);
        $this->assertEquals($subtask->id, $parent->subtasks->first()->id);
    }

    public function test_task_can_have_attachments(): void
    {
        $task = Task::first();
        $user = User::first();

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'filename' => 'spec.pdf',
            'disk' => 'public',
            'path' => 'task-attachments/spec.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 2048576,
        ]);

        $this->assertCount(1, $task->attachments);
        $this->assertEquals('spec.pdf', $task->attachments->first()->filename);
    }

    public function test_existing_task_can_be_linked_and_unlinked_as_subtask(): void
    {
        $parent = Task::whereNull('parent_task_id')->first();
        $standalone = Task::whereNull('parent_task_id')->where('id', '!=', $parent->id)->first();

        // Link
        $standalone->update(['parent_task_id' => $parent->id, 'type' => 'subtask']);
        $this->assertTrue($parent->subtasks->contains($standalone));

        // Unlink
        $standalone->update(['parent_task_id' => null, 'type' => 'task']);
        $this->assertFalse($parent->fresh()->subtasks->contains($standalone));
    }

    public function test_media_can_be_created_and_linked_to_task_attachment(): void
    {
        $task = Task::first();
        $user = User::first();

        $media = \App\Models\Media::create([
            'filename' => 'design.png',
            'disk' => 'public',
            'path' => 'media-library/design.png',
            'mime_type' => 'image/png',
            'size_bytes' => 102400,
            'user_id' => $user->id,
        ]);

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'media_id' => $media->id,
            'user_id' => $user->id,
            'filename' => $media->filename,
            'disk' => $media->disk,
            'path' => $media->path,
            'mime_type' => $media->mime_type,
            'size_bytes' => $media->size_bytes,
        ]);

        $this->assertEquals($media->id, $attachment->media_id);
        $this->assertEquals('design.png', $attachment->media->filename);
    }

    public function test_media_type_detection(): void
    {
        $this->assertEquals('image', \App\Models\Media::detectType('image/png', 'logo.png'));
        $this->assertEquals('video', \App\Models\Media::detectType('video/mp4', 'demo.mp4'));
        $this->assertEquals('audio', \App\Models\Media::detectType('audio/mpeg', 'song.mp3'));
        $this->assertEquals('document', \App\Models\Media::detectType('application/pdf', 'spec.pdf'));
        $this->assertEquals('archive', \App\Models\Media::detectType('application/zip', 'backup.zip'));
    }

    public function test_locale_switcher_updates_session(): void
    {
        $response = $this->get('/admin/switch-locale/vi');
        $response->assertSessionHas('locale', 'vi');
    }
}
