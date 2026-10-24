import { Metadata } from "next";
import { SketchCanvasView } from "@/features/sketch/sketch-canvas-view";

interface SketchPageProps {
  params: {
    projectId: string;
  };
}

export function generateMetadata({ params }: SketchPageProps): Metadata {
  return {
    title: `Sketch Canvas — Earth`,
    description: `Interactive system architecture diagrams, visual thinking, and node topologies for ${params.projectId}`,
  };
}

export default function SketchPage({ params }: SketchPageProps) {
  return <SketchCanvasView projectId={params.projectId} />;
}
