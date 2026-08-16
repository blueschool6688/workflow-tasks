import { ProjectCalendarPage } from '@/features/calendar/pages/ProjectCalendarPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Lịch Công việc ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function CalendarRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <ProjectCalendarPage projectKey={projectKey} />;
}
