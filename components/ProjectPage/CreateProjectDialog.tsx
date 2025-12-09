import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateProjectDialogProps {
  name: string;
  setName: (v: string) => void;
  stack: string;
  setStack: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onCreate: () => void;
}

export function CreateProjectDialog({ name, setName, stack, setStack, description, setDescription, onCreate }: CreateProjectDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-4">Create New Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Select value={stack} onValueChange={setStack}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a stack" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Stack</SelectLabel>
                <SelectItem value="MERN">MERN</SelectItem>
                <SelectItem value="NextJs">NextJs</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" />
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <Button onClick={onCreate} type="button">Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
