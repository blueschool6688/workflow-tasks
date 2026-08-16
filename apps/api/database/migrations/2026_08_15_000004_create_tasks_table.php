<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('epics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->text('summary')->nullable();
            $table->string('color')->default('#818cf8');
            $table->timestamps();
        });

        Schema::create('sprints', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->text('goal')->nullable();
            $table->enum('status', ['future', 'active', 'completed'])->default('future');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('task_number'); // e.g. PROJ-1
            $table->string('title');
            $table->longText('description')->nullable();
            $table->enum('type', ['task', 'bug', 'story', 'epic', 'subtask'])->default('task');
            $table->foreignUuid('status_id')->constrained('workflow_statuses')->onDelete('restrict');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->uuid('parent_task_id')->nullable();
            $table->foreignUuid('sprint_id')->nullable()->constrained('sprints')->onDelete('set null');
            $table->foreignUuid('epic_id')->nullable()->constrained('epics')->onDelete('set null');
            $table->dateTime('due_date')->nullable();
            $table->integer('estimate_minutes')->nullable();
            $table->integer('time_spent_minutes')->default(0);
            $table->integer('order')->default(0);
            $table->json('labels')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'task_number']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('parent_task_id')->references('id')->on('tasks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('sprints');
        Schema::dropIfExists('epics');
    }
};
