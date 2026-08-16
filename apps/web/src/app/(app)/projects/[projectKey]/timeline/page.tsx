import { ProjectGanttPage } from '@/features/gantt/pages/ProjectGanttPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Timeline & Gantt ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function ProjectTimelineRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <ProjectGanttPage projectKey={projectKey} />;
}
