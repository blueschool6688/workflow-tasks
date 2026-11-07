import { api } from "@/lib/axios";

export interface Project {
  id: string | number;
  name: string;
  key: string;
  description?: string;
  type: "scrum" | "kanban" | "freeform";
  status?: "active" | "archived";
  members_count?: number;
  open_tasks_count?: number;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description?: string;
  type: "scrum" | "kanban" | "freeform";
}

export async function getProjectsApi(): Promise<Project[]> {
  const res = await api.get("/projects", { params: { per_page: 100 } });
  return res.data.data;
}

export async function createProjectApi(
  payload: CreateProjectPayload
): Promise<Project> {
  const res = await api.post("/projects", payload);
  return res.data.data || res.data;
}
