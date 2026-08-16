/**
 * Core Data Models & API Contracts
 * Auto-generated and custom type definitions for API and Client
 */

export interface User {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'member' | 'guest';
  avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logo?: string | null;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  key: string;
  description?: string | null;
  type: 'scrum' | 'kanban' | 'freeform';
  status: 'active' | 'archived' | 'completed';
  workflow_id?: string;
  lead_id?: string;
  start_date?: string | null;
  target_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStatus {
  id: string;
  workflow_id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
  category: 'todo' | 'in_progress' | 'done';
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  from_status_id: string;
  to_status_id: string;
  name?: string;
  rules?: {
    allowed_roles?: string[];
    required_fields?: string[];
    conditions?: Record<string, unknown>;
  };
}

export interface Workflow {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
}

export interface Task {
  id: string;
  project_id: string;
  task_number: string;
  title: string;
  description?: string | null;
  type: 'task' | 'bug' | 'story' | 'epic' | 'subtask';
  status_id: string;
  status?: WorkflowStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | null;
  assignee?: User | null;
  reporter_id: string;
  reporter?: User;
  parent_task_id?: string | null;
  sprint_id?: string | null;
  due_date?: string | null;
  estimate_minutes?: number | null;
  time_spent_minutes?: number;
  order: number;
  labels?: string[];
  custom_fields?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string | null;
  status: 'future' | 'active' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}
