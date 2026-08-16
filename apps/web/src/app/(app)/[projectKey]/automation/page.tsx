import { ProjectAutomationPage } from '@/features/automation/pages/ProjectAutomationPage';

export async function generateMetadata({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return {
    title: `Automation ${projectKey.toUpperCase()} — Tasks`,
  };
}

export default async function AutomationRoutePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params;
  return <ProjectAutomationPage projectKey={projectKey} />;
}
