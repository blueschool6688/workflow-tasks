import { redirect } from 'next/navigation';
import { api } from '@/lib/axios';

export default async function ProjectSprintsIndexPage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;

  let activeSprintId = 'sprint-24';
  try {
    const res = await api.get(`/projects/${projectKey}/sprints`);
    const sprints = res.data?.data || [];
    const active = sprints.find((s: any) => s.status === 'active');
    if (active) {
      activeSprintId = active.id;
    } else if (sprints.length > 0) {
      activeSprintId = sprints[0].id;
    }
  } catch {
    // Fallback default
  }

  redirect(`/projects/${projectKey}/sprints/${activeSprintId}/board`);
}
