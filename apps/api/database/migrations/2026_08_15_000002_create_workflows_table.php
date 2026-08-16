<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->nullable()->constrained('workspaces')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('workflow_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->string('color')->default('#6366f1');
            $table->integer('order')->default(0);
            $table->enum('category', ['todo', 'in_progress', 'done'])->default('todo');
            $table->timestamps();

            $table->unique(['workflow_id', 'slug']);
        });

        Schema::create('workflow_transitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignUuid('from_status_id')->constrained('workflow_statuses')->onDelete('cascade');
            $table->foreignUuid('to_status_id')->constrained('workflow_statuses')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->json('rules')->nullable(); // allowed_roles, required_fields, conditions
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_transitions');
        Schema::dropIfExists('workflow_statuses');
        Schema::dropIfExists('workflows');
    }
};
