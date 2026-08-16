import { api } from '@/lib/axios';

export interface KanbanTask {
  id: string;
  title: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  category: 'todo' | 'in_progress' | 'done';
  wip_limit?: number;
  tasks: KanbanTask[];
}

export async function getKanbanBoardApi(projectKey: string): Promise<KanbanColumnData[]> {
  try {
    const res = await api.get(`/projects/${projectKey}/board`);
    return res.data.data || res.data;
  } catch {
    // Return mock data for initial UI verification
    return [
      {
        id: 'todo',
        title: 'Cần làm',
        category: 'todo',
        tasks: [
          {
            id: 'PROJ-101',
            title: 'Thiết kế Schema Multi-tenant Organization & Workspace',
            status: 'todo',
            priority: 'high',
            assignee: { name: 'Alex K.' },
            labels: ['Backend', 'DB'],
            checklist_progress: { completed: 2, total: 4 },
            estimate: '4h',
          },
          {
            id: 'PROJ-102',
            title: 'Tích hợp Spatie Permission Shield & Policy Gates',
            status: 'todo',
            priority: 'urgent',
            assignee: { name: 'Sarah T.' },
            labels: ['Security'],
            estimate: '6h',
          },
        ],
      },
      {
        id: 'in_progress',
        title: 'Đang thực hiện',
        category: 'in_progress',
        wip_limit: 3,
        tasks: [
          {
            id: 'PROJ-103',
            title: 'Xây dựng Bảng Kanban kéo thả với dnd-kit & motion',
            status: 'in_progress',
            priority: 'urgent',
            assignee: { name: 'David L.' },
            labels: ['Frontend', 'UI'],
            checklist_progress: { completed: 5, total: 6 },
            estimate: '8h',
          },
        ],
      },
      {
        id: 'review',
        title: 'Đánh giá (Review)',
        category: 'in_progress',
        tasks: [
          {
            id: 'PROJ-104',
            title: 'Cấu hình Scramble OpenAPI & sync generator sang api-types',
            status: 'review',
            priority: 'medium',
            assignee: { name: 'Elena R.' },
            labels: ['DevOps'],
            estimate: '3h',
          },
        ],
      },
      {
        id: 'done',
        title: 'Hoàn thành',
        category: 'done',
        tasks: [
          {
            id: 'PROJ-100',
            title: 'Khởi tạo cấu trúc Turborepo Monorepo & Pnpm workspaces',
            status: 'done',
            priority: 'medium',
            assignee: { name: 'Alex K.' },
            labels: ['Infra'],
            estimate: '2h',
          },
        ],
      },
    ];
  }
}

export async function updateTaskStatusApi(taskId: string, statusId: string) {
  const res = await api.patch(`/tasks/${taskId}/status`, { status_id: statusId });
  return res.data;
}
