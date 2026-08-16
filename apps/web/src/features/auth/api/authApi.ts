import { api } from '@/lib/axios';
import { WorkspaceInfo } from '@/stores/authStore';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string | number;
    name: string;
    username: string;
    email: string;
    avatar?: string | null;
    role: string;
    current_workspace_id?: string | null;
  };
  workspaces: WorkspaceInfo[];
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function getMeApi() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function logoutApi() {
  const response = await api.post('/auth/logout');
  return response.data;
}
