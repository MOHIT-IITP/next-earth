"use client";
// TODO: add a loader when updating the project
// TODO: the project is not updating in realtime
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { updateProject } from "@/lib/action";
import { useState } from "react";
import { RxUpdate } from "react-icons/rx";

interface Project {
  id: string;
  name: string;
  description?: string;
  stack?: string;
}

export default function UpdateDialog({ project }: { project: Project }) {
  const [formData, setFormData] = useState({
    name: project.name,
    stack: project.stack || "",
    description: project.description || "",
  });
    

  // works for text inputs
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // works for <Select>
  const handleSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      stack: value,
    }));
  };

  const handleUpdateProject = async () => {
    try {
      await updateProject(project.id, formData);
      alert("Project updated!");
    } catch (error) {
      console.error("Client update Project error:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="px-3 py-1 text-black rounded">
                    <RxUpdate/>

      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Your Project</DialogTitle>
          <DialogDescription>Edit your project details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          
          {/* Select field */}
          <Select value={formData.stack} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select tech stack" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Stack</SelectLabel>
                <SelectItem value="MERN">MERN</SelectItem>
                <SelectItem value="NextJs">NextJs</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Input fields */}
          <Input
            name="name"
            value={formData.name}
            onChange={handleInput}
            placeholder="Project Name"
          />

          <Input
            name="description"
            value={formData.description}
            onChange={handleInput}
            placeholder="Description"
          />

          <button
            onClick={handleUpdateProject}
          >
            Update
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}

