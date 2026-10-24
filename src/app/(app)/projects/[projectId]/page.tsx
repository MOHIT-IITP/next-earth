import { Metadata } from "next";
import { ProjectDetailView } from "@/features/projects/project-detail-view";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  return {
    title: `Project Overview — Earth`,
    description: `Detailed project metrics, field tasks, and ecological observations for ${params.projectId}`,
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return <ProjectDetailView projectId={params.projectId} />;
}
