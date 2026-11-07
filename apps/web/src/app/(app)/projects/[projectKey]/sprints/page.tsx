import { redirect } from "next/navigation";

export default async function ProjectSprintsIndexPage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;
  redirect(`/projects/${projectKey}/board`);
}
