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

        $from = $request->input('from', today()->startOfMonth()->toDateString());
        $to   = $request->input('to', today()->endOfMonth()->toDateString());

        $tasks = Task::query()
            ->where('assignee_id', $user->id)
            ->whereBetween('due_date', [$from, $to])
            ->with(['status', 'project'])
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /** Global Summary — workspace-wide aggregations */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $projectQuery = Project::query()
            ->when($user->role !== 'admin', fn ($q) => $q->whereHas('members', fn ($m) => $m->where('users.id', $user->id)));

        $totalProjects = (clone $projectQuery)->count();
        $projectIds = (clone $projectQuery)->pluck('id');

        $tasks = Task::whereIn('project_id', $projectIds)->with('status')->get();
        $totalTasks = $tasks->count();

        $byCategory = [
            'todo'        => 0,
            'in_progress' => 0,
            'in_review'   => 0,
            'done'        => 0,
        ];

        foreach ($tasks as $task) {
            $cat = $task->status?->category ?? 'todo';
            if (isset($byCategory[$cat])) {
                $byCategory[$cat]++;
            } else {
                $byCategory['in_progress']++;
            }
        }

        $totalEstimate = $tasks->sum('estimate_minutes') ?? 0;
        $totalLogged   = $tasks->sum('time_spent_minutes') ?? 0;
        $activeSprints = Sprint::whereIn('project_id', $projectIds)->where('status', 'active')->count();

        $completionRate = $totalTasks > 0 ? round(($byCategory['done'] / $totalTasks) * 100, 1) : 0;

        return response()->json([
            'data' => [
                'total_projects'  => $totalProjects,
                'total_tasks'     => $totalTasks,
                'completion_rate' => $completionRate,
                'active_sprints'  => $activeSprints,
                'by_category'     => $byCategory,
                'total_estimate_hours' => round($totalEstimate / 60, 1),
                'total_logged_hours'   => round($totalLogged / 60, 1),
            ],
        ]);
    }

    /** Project Summary — detailed project metrics */
    public function projectSummary(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $tasks = $project->tasks()->with(['status', 'assignee', 'epic', 'sprint'])->get();
        $totalTasks = $tasks->count();

        $byCategory = [
            'todo'        => 0,
            'in_progress' => 0,
            'in_review'   => 0,
            'done'        => 0,
        ];

        foreach ($tasks as $t) {
            $cat = $t->status?->category ?? 'todo';
            if (isset($byCategory[$cat])) {
                $byCategory[$cat]++;
            } else {
                $byCategory['in_progress']++;
            }
        }

        $sprintsCount = $project->sprints()->count();
        $epicsCount   = $project->epics()->count();
        $membersCount = $project->members()->count();

        $completionRate = $totalTasks > 0 ? round(($byCategory['done'] / $totalTasks) * 100, 1) : 0;

        return response()->json([
            'data' => [
                'project'         => [
                    'id'          => $project->id,
                    'name'        => $project->name,
                    'key'         => $project->key,
                    'type'        => $project->type,
                    'status'      => $project->status,
                ],
                'total_tasks'     => $totalTasks,
                'completion_rate' => $completionRate,
                'sprints_count'   => $sprintsCount,
                'epics_count'     => $epicsCount,
                'members_count'   => $membersCount,
                'by_category'     => $byCategory,
            ],
        ]);
    }
}
