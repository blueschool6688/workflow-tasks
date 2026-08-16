import { redirect } from 'next/navigation';

export default async function SprintDetailRedirectPage({
  params,
}: {
  params: Promise<{ projectKey: string; sprintId: string }>;
}) {
  const { projectKey, sprintId } = await params;
  redirect(`/projects/${projectKey}/sprints/${sprintId}/board`);
}
