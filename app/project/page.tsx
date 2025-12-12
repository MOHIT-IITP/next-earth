"use client";
import { Spinner } from "@/components/ui/spinner"

// TODO: when creating a new project , a loader should come 
// TODO: when i an deleting the project then it's not deleting the project immediate

export function SpinnerDemo() {
    return (
        <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Spinner />
        </div>
    )
}


import Link from 'next/link';
import { useEffect, useState } from 'react';




import { CreateProjectDialog } from '@/components/ProjectPage/CreateProjectDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AiTwotoneDelete } from "react-icons/ai";
import { deleteProject } from "@/lib/action";
import toast from "react-hot-toast";
import UpdateDialog from "@/components/ProjectPage/UpdateDialog";
import { getAllProject } from "@/lib/project";


interface Project {
    id: string;
    name: string;
    description: string | null;
    stack: string;
    createdAt: string;
}

export default function ProjectPage() {


    const [name, setName] = useState("");
    const [stack, setStack] = useState("");
    const [description, setDescription] = useState(""); 
    const [ projects, setProjects] = useState<Project[]>([]);
    const [Loading, setLoading] = useState(false);


    useEffect(()=>{
        const getProjects = async () => {
            const res = await fetch("/api/project", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            setLoading(true);
            setProjects(data.projects);
            setLoading(false);
        };
        getProjects();
    }, [])
    if (Loading) return <p> loading.....</p>
    if(projects.length === 0){
        return <>
            <div className='w-full h-full flex justify-center items-center '>
                <div className="flex justify-center items-center p-4 gap-4 ">
                    <Spinner />
                    Loading Projects
                </div>

            </div>
        </>;
    }

    const createProject = async () => {
        const res = await fetch("/api/project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                stack,
                description
            })
        });

        if (res.ok) {
            const { project } = await res.json();
            setProjects((prev) => [project, ...prev]);
            setName("");
            setStack("");
            setDescription("");
        } else {
            const { error } = await res.json();
            alert("Error creating project: " + error);
        }
    };

    const handleDeleteProject  = async (projectId: string) => {
        await deleteProject(projectId);
        toast.success("Successfully Deleted");
    };


    return (
        <div className="pt-20 min-h-screen flex flex-col items-center bg-background">
            <div className="w-full max-w-2xl flex flex-col items-center">
                <CreateProjectDialog
                    name={name}
                    setName={setName}
                    stack={stack}
                    setStack={setStack}
                    description={description}
                    setDescription={setDescription}
                    onCreate={createProject}
                />
                <h2 className="text-2xl font-bold mb-4">Projects</h2>
                <Card className="w-full max-h-[400px] overflow-y-auto relative">
                    <CardHeader className="sticky -top-4.5 z-10  bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
                        <CardTitle>All Projects</CardTitle>
                        <CardDescription>List of all your projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-200">
                            {projects.map((project) => (
                                <li key={project.id} className="py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                                    <div className="flex justify-between items-center">
                                        {/* main section  left half  */}
                                        <div>

                                            <Link href={`/project/${project.id}`} className="block">
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{project.name}</div>
                                                <div className="text-xs text-gray-500">{project.stack}</div>
                                                <div className="text-xs text-gray-500">{project.description}</div>
                                            </Link>
                                        </div>
                                        {/* right half */}
                                        <div className="flex justify-center items-center gap-6">
                                            <UpdateDialog project={project} />
                                            <div className="hover:text-red-500">
                                                <button onClick={() => handleDeleteProject(project.id)}>
                                                    <AiTwotoneDelete/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
