<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** My open tasks + today's due tasks — for "My Work" panel */
    public function myWork(Request $request): JsonResponse
    {
        $user = $request->user();

        $myTasks = Task::query()
            ->where('assignee_id', $user->id)
            ->whereHas('status', fn ($q) => $q->whereNotIn('category', ['done', 'cancelled']))
            ->with(['status', 'project'])
            ->orderBy('due_date')
            ->limit(20)
            ->get();

        $dueTodayTasks = Task::query()
            ->where('assignee_id', $user->id)
            ->whereDate('due_date', today())
            ->with(['status', 'project'])
            ->get();

        $overdueTasks = Task::query()
            ->where('assignee_id', $user->id)
            ->whereDate('due_date', '<', today())
            ->whereHas('status', fn ($q) => $q->whereNotIn('category', ['done', 'cancelled']))
            ->with(['status', 'project'])
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'my_tasks'     => $myTasks,
                'due_today'    => $dueTodayTasks,
                'overdue'      => $overdueTasks,
            ],
        ]);
    }

    /** Project analytics — velocity, task distribution by status */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $projects = Project::query()
            ->when($user->role !== 'admin', fn ($q) => $q->whereHas('members', fn ($m) => $m->where('users.id', $user->id)))
            ->with(['tasks' => fn ($q) => $q->with('status')])
            ->get();

        $stats = $projects->map(function (Project $project) {
            $tasks = $project->tasks;

            $byStatus = $tasks->groupBy('status.category')->map->count();

            return [
                'project_id'   => $project->id,
                'project_name' => $project->name,
                'total_tasks'  => $tasks->count(),
                'by_status'    => $byStatus,
                'completed'    => $byStatus->get('done', 0),
                'in_progress'  => $byStatus->get('in_progress', 0),
            ];
        });

        return response()->json(['data' => $stats]);
    }

    /** Calendar view — tasks with due_date in a given range */
    public function calendar(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $tasks = Task::query()
            ->where('assignee_id', $user->id)
            ->whereBetween('due_date', [$request->input('from'), $request->input('to')])
            ->with(['status', 'project'])
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $tasks]);
    }
}
