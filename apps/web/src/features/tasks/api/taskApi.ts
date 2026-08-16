import { api } from '@/lib/axios';

export interface TaskDetail {
  id: string;
  project_id: string;
  task_number: string;
  title: string;
  description?: string;
  type: 'task' | 'bug' | 'story' | 'epic' | 'subtask';
  status_id?: string;
  status?: {
    id: string;
    name: string;
    color?: string;
    category?: 'todo' | 'in_progress' | 'done';
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: number | string;
  assignee?: {
    id: number | string;
    name: string;
    email?: string;
    avatar_url?: string;
  };
  reporter_id?: number | string;
  reporter?: {
    id: number | string;
    name: string;
    email?: string;
  };
  tester_id?: number | string;
  tester?: {
    id: number | string;
    name: string;
    email?: string;
  };
  sprint_id?: string;
  epic_id?: string;
  parent_task_id?: string;
  due_date?: string;
  estimate_minutes?: number;
  time_spent_minutes?: number;
  order?: number;
  labels?: string[];
  custom_fields?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCommentItem {
  id: string;
  task_id: string;
  user_id: number | string;
  user?: {
    id: number | string;
    name: string;
    email?: string;
    avatar_url?: string;
  };
  content: string;
  body?: string;
  created_at: string;
}

export interface TaskAttachmentItem {
  id: string;
  filename: string;
  path: string;
  mime_type?: string;
  size_bytes?: number;
  created_at?: string;
}

export async function getTaskDetailApi(taskIdOrNumber: string): Promise<TaskDetail> {
  const res = await api.get<{ data: TaskDetail }>(`/tasks/${taskIdOrNumber}`);
  return res.data.data;
}

export async function updateTaskApi(taskIdOrNumber: string, payload: Partial<TaskDetail>): Promise<TaskDetail> {
  const res = await api.patch<{ data: TaskDetail }>(`/tasks/${taskIdOrNumber}`, payload);
  return res.data.data;
}

export async function createTaskApi(projectKeyOrId: string, payload: Partial<TaskDetail>): Promise<TaskDetail> {
  const res = await api.post<{ data: TaskDetail }>(`/projects/${projectKeyOrId}/tasks`, payload);
  return res.data.data;
}

export async function deleteTaskApi(taskIdOrNumber: string): Promise<void> {
  await api.delete(`/tasks/${taskIdOrNumber}`);
}

export async function getTaskCommentsApi(taskIdOrNumber: string): Promise<TaskCommentItem[]> {
  try {
    const res = await api.get<{ data: TaskCommentItem[] }>(`/tasks/${taskIdOrNumber}/comments`);
    return res.data.data || [];
  } catch {
    return [];
  }
}

export async function postTaskCommentApi(taskIdOrNumber: string, content: string): Promise<TaskCommentItem> {
  const res = await api.post<{ data: TaskCommentItem }>(`/tasks/${taskIdOrNumber}/comments`, {
    content,
    body: content,
  });
  return res.data.data;
}

export async function deleteTaskCommentApi(taskIdOrNumber: string, commentId: string): Promise<void> {
  await api.delete(`/tasks/${taskIdOrNumber}/comments/${commentId}`);
}

export async function uploadTaskMediaApi(taskIdOrNumber: string, file: File): Promise<TaskAttachmentItem> {
  const formData = new FormData();
  formData.append('file', file);
  const mediaRes = await api.post('/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const mediaId = mediaRes.data.data.id;

  await api.post(`/tasks/${taskIdOrNumber}/attachments`, { media_id: mediaId });

  return {
    id: mediaId,
    filename: file.name,
    path: mediaRes.data.data.path || file.name,
    mime_type: file.type,
    size_bytes: file.size,
    created_at: new Date().toISOString(),
  };
}

export async function getTaskActivityApi(taskIdOrNumber: string): Promise<any[]> {
  try {
    const res = await api.get(`/tasks/${taskIdOrNumber}/activity`);
    return res.data.data || [];
  } catch {
    return [];
  }
}

export interface TaskWorkLogItem {
  id: string;
  task_id: string;
  user_id: number | string;
  user?: {
    id: number | string;
    name: string;
    avatar_url?: string;
  };
  minutes_logged: number;
  description?: string;
  logged_at: string;
  created_at?: string;
}

export async function getTaskWorkLogsApi(taskIdOrNumber: string): Promise<TaskWorkLogItem[]> {
  try {
    const res = await api.get<{ data: TaskWorkLogItem[] }>(`/tasks/${taskIdOrNumber}/worklogs`);
    return res.data.data || [];
  } catch {
    return [];
  }
}

export async function postTaskWorkLogApi(
  taskIdOrNumber: string,
  minutesLogged: number,
  description?: string,
  loggedAt?: string
): Promise<TaskWorkLogItem> {
  const res = await api.post<{ data: TaskWorkLogItem }>(`/tasks/${taskIdOrNumber}/worklogs`, {
    minutes_logged: minutesLogged,
    description,
    logged_at: loggedAt,
  });
  return res.data.data;
}

export async function deleteTaskWorkLogApi(taskIdOrNumber: string, workLogId: string): Promise<void> {
  await api.delete(`/tasks/${taskIdOrNumber}/worklogs/${workLogId}`);
}

