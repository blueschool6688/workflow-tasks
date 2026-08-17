import { api } from '@/lib/axios';

export interface WorkflowStatusItem {
  id: string;
  name: string;
  slug?: string;
  color: string;
  category: 'todo' | 'in_progress' | 'done' | 'cancelled';
  order: number;
}

export interface WorkflowTransitionItem {
  id: string;
  from_status_id: string;
  to_status_id: string;
  name?: string;
  rules?: Record<string, any>;
}

export interface ProjectWorkflowData {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  statuses: WorkflowStatusItem[];
  transitions: WorkflowTransitionItem[];
}

export interface ProjectWorkflowResponse {
  data: ProjectWorkflowData;
  can_manage_workflow: boolean;
  all_workflows?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export async function getProjectWorkflowApi(projectKey: string): Promise<ProjectWorkflowResponse> {
  const res = await api.get(`/projects/${projectKey}/workflow`);
  return res.data;
}

export async function saveProjectWorkflowApi(
  projectKey: string,
  payload: { workflow_id?: string; name?: string; description?: string }
) {
  const res = await api.post(`/projects/${projectKey}/workflow`, payload);
  return res.data;
}

export async function createProjectStatusApi(
  projectKey: string,
  payload: {
    name: string;
    color?: string;
    category?: 'todo' | 'in_progress' | 'done' | 'cancelled';
    order?: number;
  }
) {
  const res = await api.post(`/projects/${projectKey}/workflow/statuses`, payload);
  return res.data;
}

export async function updateProjectStatusApi(
  projectKey: string,
  statusId: string,
  payload: {
    name?: string;
    color?: string;
    category?: 'todo' | 'in_progress' | 'done' | 'cancelled';
    order?: number;
  }
) {
  const res = await api.patch(`/projects/${projectKey}/workflow/statuses/${statusId}`, payload);
  return res.data;
}

export async function deleteProjectStatusApi(projectKey: string, statusId: string) {
  const res = await api.delete(`/projects/${projectKey}/workflow/statuses/${statusId}`);
  return res.data;
}

export async function createProjectTransitionApi(
  projectKey: string,
  payload: {
    from_status_id: string;
    to_status_id: string;
    name?: string;
    rules?: Record<string, any>;
  }
) {
  const res = await api.post(`/projects/${projectKey}/workflow/transitions`, payload);
  return res.data;
}

export async function deleteProjectTransitionApi(projectKey: string, transitionId: string) {
  const res = await api.delete(`/projects/${projectKey}/workflow/transitions/${transitionId}`);
  return res.data;
}
