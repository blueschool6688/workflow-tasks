import { api } from "@/lib/axios";

export interface KanbanTask {
  id: string;
  task_number?: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: {
    name: string;
    avatar?: string;
  };
  labels?: string[];
  checklist_progress?: {
    completed: number;
    total: number;
  };
  estimate?: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  category: "todo" | "in_progress" | "done";
  wip_limit?: number;
  tasks: KanbanTask[];
}

export interface KanbanBoardResult {
  columns: KanbanColumnData[];
  can_manage_workflow: boolean;
  workflow?: any;
}

export async function getKanbanBoardFullApi(
  projectKey: string,
  sprintId?: string
): Promise<KanbanBoardResult> {
  const res = await api.get(`/projects/${projectKey}/board`, {
    params: sprintId ? { sprint_id: sprintId } : undefined,
  });

  const columns: KanbanColumnData[] = (res.data.data ?? []).map((col: any) => ({
    id: String(col.id),
    title: col.title,
    category: col.category,
    wip_limit: col.wip_limit,
    tasks: (col.tasks ?? []).map((t: any) => ({
      id: String(t.id),
      task_number: t.task_number,
      title: t.title,
      status: String(t.status_id ?? col.id),
      priority: t.priority || "medium",
      assignee: t.assignee
        ? { name: t.assignee.name, avatar: t.assignee.avatar_url }
        : undefined,
      labels: t.labels || [],
      estimate: t.estimate_minutes
        ? `${(t.estimate_minutes / 60).toFixed(1)}h`
        : undefined,
    })),
  }));

  return {
    columns,
    can_manage_workflow: Boolean(res.data.can_manage_workflow),
    workflow: res.data.workflow,
  };
}

export async function updateTaskStatusApi(taskId: string, statusId: string) {
  const res = await api.patch(`/tasks/${taskId}/status`, {
    status_id: statusId,
  });
  return res.data;
}
