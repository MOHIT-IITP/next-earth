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
import { createTodo } from "@/lib/action";


interface FormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
}

export default function CreateTodoDialog({ formData, setFormData }: { formData: FormData; setFormData: React.Dispatch<React.SetStateAction<FormData>> }) {
    
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

  const handleCreateTodo = async () => {
    try {
      await createTodo(formData);
      alert("Project updated!");
    } catch (error) {
      console.error("Client update Project error:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="px-3 py-1 text-black rounded">
        Create Todo
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Your Project</DialogTitle>
          <DialogDescription>Edit your project details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          
          {/* Select field */}
          <Select value={formData.status} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select tech stack" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="DOING">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* select field for the priority */}
          <Select value={formData.priority} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Input fields */}
          <Input
            name="title"
            value={formData.title}
            onChange={handleInput}
            placeholder="Project Title"
          />

          <Input
            name="description"
            value={formData.description}
            onChange={handleInput}
            placeholder="Description"
          />

          <button
            onClick={handleCreateTodo}
          >
            Update
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
}

