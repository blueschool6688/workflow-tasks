import { api } from '@/lib/axios';

export interface GlobalSummary {
  total_projects: number;
  total_tasks: number;
  completion_rate: number;
  active_sprints: number;
  by_category: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
  };
  total_estimate_hours: number;
  total_logged_hours: number;
}

export interface ProjectSummaryData {
  project: {
    id: string;
    name: string;
    key: string;
    type: string;
    status: string;
  };
  total_tasks: number;
  completion_rate: number;
  sprints_count: number;
  epics_count: number;
  members_count: number;
  by_category: {
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
  };
}

export async function getGlobalSummaryApi(): Promise<GlobalSummary> {
  const res = await api.get<{ data: GlobalSummary }>('/dashboard/summary');
  return res.data.data;
}

export async function getProjectSummaryApi(projectKeyOrId: string): Promise<ProjectSummaryData> {
  const res = await api.get<{ data: ProjectSummaryData }>(`/projects/${projectKeyOrId}/summary`);
  return res.data.data;
}

export async function getMyWorkApi() {
  const res = await api.get('/dashboard/my-work');
  return res.data.data;
}
