import { BacklogPage } from '@/features/backlog/pages/BacklogPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Backlog ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function ProjectBacklogRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <BacklogPage projectKey={projectKey} />;
}
