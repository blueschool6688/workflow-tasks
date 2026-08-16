import { api } from '@/lib/axios';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    current_workspace_id?: number | null;
  };
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
