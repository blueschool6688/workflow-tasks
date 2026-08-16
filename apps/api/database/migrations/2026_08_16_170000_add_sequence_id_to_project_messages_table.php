<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('CREATE SEQUENCE IF NOT EXISTS project_messages_sequence_id_seq;');
            DB::statement('ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS sequence_id BIGINT NOT NULL DEFAULT nextval(\'project_messages_sequence_id_seq\');');
            DB::statement('ALTER SEQUENCE project_messages_sequence_id_seq OWNED BY project_messages.sequence_id;');
        } elseif ($driver === 'sqlite') {
            Schema::table('project_messages', function (Blueprint $table) {
                $table->bigInteger('sequence_id')->nullable();
            });
        } else {
            Schema::table('project_messages', function (Blueprint $table) {
                $table->unsignedBigInteger('sequence_id')->nullable();
            });
        }

        Schema::table('project_messages', function (Blueprint $table) {
            $table->index(['project_id', 'sequence_id'], 'idx_proj_msg_project_sequence');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_messages', function (Blueprint $table) {
            $table->dropIndex('idx_proj_msg_project_sequence');
            $table->dropColumn('sequence_id');
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP SEQUENCE IF EXISTS project_messages_sequence_id_seq;');
        }
    }
};
