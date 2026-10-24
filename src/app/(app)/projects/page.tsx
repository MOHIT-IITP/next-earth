import { Metadata } from "next";
import { ProjectsListView } from "@/features/projects/projects-list-view";

export const metadata: Metadata = {
  title: "Territory Projects — Earth",
  description: "Browse, filter, and manage all Earth ecological research projects",
};

export default function ProjectsPage() {
  return <ProjectsListView />;
}
