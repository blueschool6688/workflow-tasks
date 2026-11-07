import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://tasks.test/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;
  if (!token && typeof window !== "undefined") {
    try {
      const persisted = localStorage.getItem("tasks-auth");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        token = parsed?.state?.token;
      }
    } catch {
      // Ignore
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: { message?: string } } })
    ?.response?.data;
  return data?.message || fallback;
}

/** Follows Laravel pagination until the last page; the backlog needs every task, not page 1. */
export async function fetchAllPages<T>(url: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const res = await api.get(url, { params: { per_page: 100, page } });
    items.push(...(res.data.data ?? []));
    if (!res.data.meta || page >= res.data.meta.last_page) return items;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login")) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
