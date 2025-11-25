import { prisma } from '@/lib/prisma';

interface ProjectServerProps {
  projectId: string;
}

export default async function ProjectServer({ projectId }: ProjectServerProps) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Project Details</h2>
      <div className="mb-2">Name: {project.name}</div>
      <div className="mb-2">Description: {project.description}</div>
      <div className="mb-2">ID: {project.id}</div>
      {/* Add more fields as needed */}
    </div>
  );
}
