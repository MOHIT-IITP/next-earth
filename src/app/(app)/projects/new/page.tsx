import { Metadata } from "next";
import { NewProjectView } from "@/features/projects/new-project-view";

export const metadata: Metadata = {
  title: "New Territory Project — Earth",
  description: "Initiate an ecological survey, research transect, or territory project",
};

export default function NewProjectPage() {
  return <NewProjectView />;
}
