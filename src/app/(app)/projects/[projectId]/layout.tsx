import * as React from "react";
import { ProjectWorkspaceHeader } from "@/features/projects/project-workspace-header";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: {
    projectId: string;
  };
}

export default function ProjectWorkspaceLayout({
  children,
  params,
}: ProjectLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ProjectWorkspaceHeader projectId={params.projectId} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
