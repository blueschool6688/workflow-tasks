import { ProjectDashboardPage } from '@/features/dashboard/pages/ProjectDashboardPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Dashboard & Reports ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function ProjectDashboardRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <ProjectDashboardPage projectKey={projectKey} />;
}
