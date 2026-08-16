import { TaskListViewPage } from '@/features/task-list/pages/TaskListViewPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Danh sách Công việc ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function TaskListRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <TaskListViewPage projectKey={projectKey} />;
}
