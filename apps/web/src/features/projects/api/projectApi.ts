import { api } from '@/lib/axios';

export interface Project {
  id: string | number;
  name: string;
  key: string;
  description?: string;
  type: 'scrum' | 'kanban' | 'freeform';
  status?: 'active' | 'archived';
  members_count?: number;
  open_tasks_count?: number;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description?: string;
  type: 'scrum' | 'kanban' | 'freeform';
}

export async function getProjectsApi(): Promise<Project[]> {
  try {
    const res = await api.get('/projects');
    return res.data.data || res.data;
  } catch {
    // Return mock data for initial UI verification
    return [
      {
        id: 1,
        name: 'Core Engineering Platform',
        key: 'PROJ',
        description: 'Dự án hạ tầng core service, API V1 và hệ thống workflow.',
        type: 'scrum',
        status: 'active',
        members_count: 8,
        open_tasks_count: 14,
        updated_at: '10 phút trước',
      },
      {
        id: 2,
        name: 'Client Mobile & Web App',
        key: 'APP',
        description: 'Ứng dụng Web/PWA client cho người dùng cuối.',
        type: 'kanban',
        status: 'active',
        members_count: 5,
        open_tasks_count: 9,
        updated_at: '2 giờ trước',
      },
    ];
  }
}

export async function createProjectApi(payload: CreateProjectPayload): Promise<Project> {
  const res = await api.post('/projects', payload);
  return res.data.data || res.data;
}
