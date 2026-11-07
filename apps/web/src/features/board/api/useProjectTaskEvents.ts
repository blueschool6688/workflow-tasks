"use client";

import * as React from "react";
import { getEcho } from "@/lib/echoService";
import { useAuthStore } from "@/stores/authStore";

interface TaskChangedEvent {
  action: "created" | "updated" | "deleted" | "bulk";
  task_id: string | null;
  project_id: string;
  actor_id: string | number | null;
}

/**
 * Calls `onRemoteChange` when someone else creates, edits, moves or deletes a task in the project.
 * Bursts (e.g. completing a sprint) are coalesced into one call.
 */
export function useProjectTaskEvents(
  projectKey: string | undefined,
  onRemoteChange: () => void
) {
  const userId = useAuthStore((s) => s.user?.id);
  const callbackRef = React.useRef(onRemoteChange);
  callbackRef.current = onRemoteChange;

  React.useEffect(() => {
    const echo = getEcho();
    if (!echo || !projectKey) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = echo.private(`project.${projectKey}`);

    channel.listen(".TaskChanged", (e: TaskChangedEvent) => {
      if (e.actor_id != null && String(e.actor_id) === String(userId)) return;
      clearTimeout(timer);
      timer = setTimeout(() => callbackRef.current(), 300);
    });

    return () => {
      clearTimeout(timer);
      channel.stopListening(".TaskChanged");
    };
  }, [projectKey, userId]);
}
