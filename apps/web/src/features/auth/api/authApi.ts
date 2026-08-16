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

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string | number;
    name: string;
    username: string;
    email: string;
    avatar?: string | null;
    role: string;
    current_workspace_id?: string | null;
  };
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function getMeApi() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const response = await api.patch<UpdateProfileResponse>('/auth/profile', payload);
  return response.data;
}

export async function changePasswordApi(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const response = await api.put<ChangePasswordResponse>('/auth/password', payload);
  return response.data;
}

export async function logoutApi() {
  const response = await api.post('/auth/logout');
  return response.data;
}
