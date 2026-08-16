<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('domain')->nullable();
            $table->string('logo')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        Schema::create('workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['organization_id', 'slug']);
        });

        Schema::create('workspace_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role')->default('member'); // owner, admin, member, guest
            $table->timestamps();

            $table->unique(['workspace_id', 'user_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('current_workspace_id')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['current_workspace_id', 'avatar', 'is_active']);
        });

        Schema::dropIfExists('workspace_members');
        Schema::dropIfExists('workspaces');
        Schema::dropIfExists('organizations');
    }
};
