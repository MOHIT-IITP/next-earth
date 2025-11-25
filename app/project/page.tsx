"use client";
import { Button } from '@/components/ui/button';
import { Spinner } from "@/components/ui/spinner"

export function SpinnerDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
          <Spinner />
    </div>
  )
}

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
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
      const res = await fetch("/api/project");
      const data = await res.json();

      if(res.ok){
        setProjects(data.projects);
      }
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

  const createProject = async() => {
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

    if(res.ok){
      alert("Project created successfully");
      setName("");
      setStack("");
      setDescription("");
    }else{
      const {error} = await res.json();
      alert("Error creating project: " + error);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Previous Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {/* List previous projects here. Replace with dynamic content as needed. */}
          <div className=" grid grid-cols-2 grid-rows-2 gap-3 items-center w-full  text-muted-foreground text-center py-4">
            {projects.map((project, id) => (
            <Link href={`/project/${project.id}`} key={id}>
            <Card className='w-full flex flex-col justify-start items-start'>
                <CardHeader>
                  <CardTitle>
                    <p className='text-lg text-gray-900'>Name: {project.name}</p>
                  </CardTitle>
                    <p className='text-sm text-gray-400'>{project.id}</p>
                <h3 className='text-gray-400'>{project.stack}</h3>
                <h3 className='text-gray-400'>{project.description}</h3>
                </CardHeader>
              </Card>
            </Link>
            ))}
          </div>
        </CardContent>
        <hr />
        <form action="">
          <div className=' px-4 w-full h-full flex   flex-col gap-8 justify-center items-center mb-4'>
            <div className='flex justify-center items-center w-full'>
              <Select value={stack} onValueChange={(value) => setStack(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a stack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="MERN">MERN</SelectItem>
                    <SelectItem value="NextJs">NextJs</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input value={name} onChange={(e) => setName(e.target.value)} className='ml-4' placeholder='Project Name' />
            </div>

            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Description' />

          </div>

          <CardFooter className="flex flex-col gap-4">
            <Button onClick={createProject}>Create New Project</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
