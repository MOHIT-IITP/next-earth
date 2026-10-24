import { Metadata } from "next";
import { NotesModuleView } from "@/features/notes/notes-module-view";

interface NotesPageProps {
  params: {
    projectId: string;
  };
}

export function generateMetadata({ params }: NotesPageProps): Metadata {
  return {
    title: `Knowledge Base Notes — Earth`,
    description: `Developer notes, field research protocols, and markdown knowledge base for ${params.projectId}`,
  };
}

export default function NotesPage({ params }: NotesPageProps) {
  return <NotesModuleView projectId={params.projectId} />;
}
