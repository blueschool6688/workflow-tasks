import { api } from '@/lib/axios';

export interface ChatAttachment {
  name: string;
  url: string;
  type?: 'image' | 'file' | string;
  size?: number;
  mime_type?: string;
}

export interface ChatUser {
  id: number | string;
  name: string;
  avatar?: string | null;
}

export interface ProjectTaskRef {
  id: string;
  task_number: string;
  title: string;
  status_id?: string;
  priority?: string;
  status?: {
    id: string;
    name: string;
    color?: string;
  } | null;
}

export interface ProjectChatMessage {
  id: string;
  project_id: string;
  user_id: number | string;
  content: string;
  attachments?: ChatAttachment[] | null;
  reply_to_id?: string | null;
  is_system?: boolean;
  is_pinned?: boolean;
  pinned_at?: string | null;
  pinned_by?: {
    id: number | string;
    name: string;
  } | null;
  reply_to?: {
    id: string;
    content: string;
    user?: {
      id: number | string;
      name: string;
    };
  } | null;
  user: ChatUser;
  created_at: string;
}

export interface ProjectChatResponse {
  data: ProjectChatMessage[];
  members: ChatUser[];
  tasks?: ProjectTaskRef[];
  pinned_message?: ProjectChatMessage | null;
}

export interface ProjectSummaryOption {
  id: string;
  key: string;
  name: string;
  type?: string;
  status?: string;
}

export async function fetchProjectMessagesApi(
  projectId: string,
  before?: string
): Promise<ProjectChatResponse> {
  const params: Record<string, string | number> = { limit: 50 };
  if (before) {
    params.before = before;
  }
  const res = await api.get(`/projects/${projectId}/messages`, { params });
  return res.data;
}

export async function sendProjectMessageApi(
  projectId: string,
  content: string,
  replyToId?: string | null,
  attachments?: ChatAttachment[]
): Promise<ProjectChatMessage> {
  const res = await api.post(`/projects/${projectId}/messages`, {
    content,
    reply_to_id: replyToId,
    attachments,
  });
  return res.data?.data;
}

export async function uploadChatAttachmentApi(
  projectId: string,
  file: File
): Promise<ChatAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post(`/projects/${projectId}/messages/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data;
}

export async function pinProjectMessageApi(
  projectId: string,
  messageId: string
): Promise<{ data: ProjectChatMessage; is_pinned: boolean; message: string }> {
  const res = await api.patch(`/projects/${projectId}/messages/${messageId}/pin`);
  return res.data;
}

export async function deleteProjectMessageApi(
  projectId: string,
  messageId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/messages/${messageId}`);
}

export async function sendTypingSignalApi(
  projectId: string,
  isTyping = true
): Promise<void> {
  try {
    await api.post(`/projects/${projectId}/typing`, { is_typing: isTyping });
  } catch {
    // Non-critical endpoint
  }
}

export async function fetchAccessibleProjectsApi(): Promise<ProjectSummaryOption[]> {
  const res = await api.get('/projects');
  return res.data?.data || [];
}
