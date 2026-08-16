import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string | number;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  role?: string;
  current_workspace_id?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  workspaces: WorkspaceInfo[];
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string, workspaces?: WorkspaceInfo[]) => void;
  setWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      workspaces: [],
      isAuthenticated: false,
      setAuth: (user, token, workspaces = []) =>
        set({
          user,
          token,
          workspaces,
          isAuthenticated: true,
        }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setCurrentWorkspaceId: (workspaceId) =>
        set((state) => ({
          user: state.user ? { ...state.user, current_workspace_id: workspaceId } : null,
        })),
      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          workspaces: [],
          isAuthenticated: false,
        }),
    }),
    {
      name: 'tasks-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
