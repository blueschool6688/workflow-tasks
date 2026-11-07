import { KanbanBoardPage } from "@/features/board/pages/KanbanBoardPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;
  return {
    title: `Bảng Kanban — ${projectKey.toUpperCase()} — Tasks`,
  };
}

// The auth token lives in the browser, so the active sprint is picked client-side by KanbanBoardPage.
export default async function ProjectBoardRoutePage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;
  return <KanbanBoardPage projectKey={projectKey} />;
}
