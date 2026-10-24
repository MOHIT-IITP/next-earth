import { Metadata } from "next";
import { KanbanBoardView } from "@/features/board/kanban-board-view";

interface BoardPageProps {
  params: {
    projectId: string;
  };
}

export function generateMetadata({ params }: BoardPageProps): Metadata {
  return {
    title: `Kanban Board — Earth`,
    description: `Task management, workflow stages, and linked research items for ${params.projectId}`,
  };
}

export default function BoardPage({ params }: BoardPageProps) {
  return <KanbanBoardView projectId={params.projectId} />;
}
