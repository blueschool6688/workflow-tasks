import { KanbanBoardPage } from '@/features/board/pages/KanbanBoardPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Bảng Kanban ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function BoardRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <KanbanBoardPage projectKey={projectKey} />;
}
