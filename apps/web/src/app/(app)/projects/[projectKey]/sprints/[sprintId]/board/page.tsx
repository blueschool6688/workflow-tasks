import { KanbanBoardPage } from '@/features/board/pages/KanbanBoardPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectKey: string; sprintId: string }>;
}) {
  const { projectKey, sprintId } = await params;
  return {
    title: `Bảng Kanban ${sprintId.toUpperCase()} — ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function SprintBoardRoutePage({
  params,
}: {
  params: Promise<{ projectKey: string; sprintId: string }>;
}) {
  const { projectKey, sprintId } = await params;
  return <KanbanBoardPage projectKey={projectKey} sprintId={sprintId} />;
}
