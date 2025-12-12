import Select  from '@/components/ProjectPage/Select';
import {  getSingleProject } from '@/lib/project';

const page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const proId = (await params).projectId;
  const project = await getSingleProject({ projectId: proId });
  console.log("project is ", project);

  const projectTitle =
    project && 'name' in project
      ? project.name
      : project && 'message' in project
      ? project.message
      : 'Unknown Project';

  return (
    <div className='flex justify-center items-center flex-col gap-8'>
      <div style={{ fontFamily: "cinzel" }} className='  font-bold text-lg bg-neutral-700 text-white dark:text-black dark:bg-white  px-8 py-2 rounded-full  gap-3  border '>
        Project : {projectTitle}
      </div>
      <Select project={project}/>
    </div>
  )
}

export default page


