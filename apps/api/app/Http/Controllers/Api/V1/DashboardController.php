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
        $projects = $this->visibleProjects($request)->get(['id', 'name']);

        $counts = Task::query()
            ->join('workflow_statuses', 'workflow_statuses.id', '=', 'tasks.status_id')
            ->whereIn('tasks.project_id', $projects->pluck('id'))
            ->groupBy('tasks.project_id', 'workflow_statuses.category')
            ->selectRaw('tasks.project_id, workflow_statuses.category, COUNT(*) as total')
            ->get()
            ->groupBy('project_id');

        $stats = $projects->map(function (Project $project) use ($counts) {
            $byStatus = ($counts->get($project->id) ?? collect())->pluck('total', 'category')->map(fn ($n) => (int) $n);

            return [
                'project_id'   => $project->id,
                'project_name' => $project->name,
                'total_tasks'  => $byStatus->sum(),
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
            ->whereDate('due_date', '>=', $from)
            ->whereDate('due_date', '<=', $to)
            ->with(['status', 'project'])
            ->orderBy('due_date')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /** Global Summary — workspace-wide aggregations */
    public function summary(Request $request): JsonResponse
    {
        $projectIds = $this->visibleProjects($request)->pluck('id');
        $totalProjects = $projectIds->count();

        $byCategory = $this->countByCategory(Task::whereIn('tasks.project_id', $projectIds));
        $totalTasks = array_sum($byCategory);

        $totals = Task::whereIn('project_id', $projectIds)
            ->selectRaw('COALESCE(SUM(estimate_minutes), 0) as estimate, COALESCE(SUM(time_spent_minutes), 0) as logged')
            ->first();
        $totalEstimate = (int) $totals->estimate;
        $totalLogged   = (int) $totals->logged;
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

        $byCategory = $this->countByCategory(Task::where('tasks.project_id', $project->id));
        $totalTasks = array_sum($byCategory);

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

    private function visibleProjects(Request $request)
    {
        $user = $request->user();

        return Project::query()->when(! $user->isAdmin(), fn ($q) => $q->accessibleBy($user));
    }

    /** `in_review` stays at 0; the frontend still reads that key. */
    private function countByCategory($taskQuery): array
    {
        $counts = $taskQuery
            ->leftJoin('workflow_statuses', 'workflow_statuses.id', '=', 'tasks.status_id')
            ->groupBy('workflow_statuses.category')
            ->selectRaw('workflow_statuses.category, COUNT(*) as total')
            ->pluck('total', 'category');

        $byCategory = ['todo' => 0, 'in_progress' => 0, 'in_review' => 0, 'done' => 0];
        foreach ($counts as $category => $total) {
            $key = array_key_exists($category ?: 'todo', $byCategory) ? ($category ?: 'todo') : 'in_progress';
            $byCategory[$key] += (int) $total;
        }

        return $byCategory;
    }
}
