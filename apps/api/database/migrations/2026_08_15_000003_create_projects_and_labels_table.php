<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->string('name');
            $table->string('key', 10);
            $table->text('description')->nullable();
            $table->enum('type', ['scrum', 'kanban', 'freeform'])->default('kanban');
            $table->enum('status', ['active', 'archived', 'completed'])->default('active');
            $table->foreignUuid('workflow_id')->nullable()->constrained('workflows')->onDelete('set null');
            $table->foreignId('lead_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('start_date')->nullable();
            $table->date('target_end_date')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'key']);
        });

        Schema::create('project_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role_in_project')->default('developer'); // lead, manager, developer, reporter, viewer
            $table->timestamps();

            $table->unique(['project_id', 'user_id']);
        });

        Schema::create('labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#4f46e5');
            $table->timestamps();

            $table->unique(['workspace_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labels');
        Schema::dropIfExists('project_members');
        Schema::dropIfExists('projects');
    }
};
