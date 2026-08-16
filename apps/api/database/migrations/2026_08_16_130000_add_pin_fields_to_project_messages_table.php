<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_messages', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false)->after('is_system');
            $table->timestamp('pinned_at')->nullable()->after('is_pinned');
            $table->foreignId('pinned_by_id')->nullable()->after('pinned_at')->constrained('users')->onDelete('set null');

            $table->index(['project_id', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::table('project_messages', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'is_pinned']);
            $table->dropForeign(['pinned_by_id']);
            $table->dropColumn(['is_pinned', 'pinned_at', 'pinned_by_id']);
        });
    }
};
