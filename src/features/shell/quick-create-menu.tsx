"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { EarthService } from "@/services/earth-service";
import { Project, TaskPriority, Diagram } from "@/services/types";
import {
  Plus,
  FolderKanban,
  CheckSquare,
  FileText,
  Network,
  Sparkles,
} from "lucide-react";

export function QuickCreateMenu({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [projects, setProjects] = React.useState<Project[]>([]);

  // Dialog states
  const [isTaskOpen, setIsTaskOpen] = React.useState(false);
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = React.useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = React.useState("");
  const [diagramType, setDiagramType] = React.useState<Diagram["type"]>("ecosystem");
  const [tags, setTags] = React.useState("Field Observation");

  const loadProjects = () => {
    const list = EarthService.getProjects({ status: "active" });
    setProjects(list);
    if (list.length > 0 && !selectedProjectId) {
      setSelectedProjectId(list[0].id);
    }
  };

  const handleOpenTask = () => {
    loadProjects();
    setTitle("");
    setDescription("");
    setIsTaskOpen(true);
  };

  const handleOpenNote = () => {
    loadProjects();
    setTitle("");
    setDescription("");
    setIsNoteOpen(true);
  };

  const handleOpenDiagram = () => {
    loadProjects();
    setTitle("");
    setIsDiagramOpen(true);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) {
      toast.error("Please provide a task title and project.");
      return;
    }

    EarthService.createTask({
      projectId: selectedProjectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
    });

    toast.success("Task Created", {
      description: `Added "${title}" to project.`,
    });

    setIsTaskOpen(false);
    onRefresh?.();
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) {
      toast.error("Please provide a note title and project.");
      return;
    }

    EarthService.createNote({
      projectId: selectedProjectId,
      title: title.trim(),
      content: description.trim() || "Field observation notes.",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    toast.success("Note Documented", {
      description: `Saved "${title}".`,
    });

    setIsNoteOpen(false);
    onRefresh?.();
  };

  const handleSubmitDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) {
      toast.error("Please provide a diagram title and project.");
      return;
    }

    EarthService.createDiagram({
      projectId: selectedProjectId,
      title: title.trim(),
      type: diagramType,
    });

    toast.success("Diagram Drafted", {
      description: `Created "${title}" architecture diagram.`,
    });

    setIsDiagramOpen(false);
    onRefresh?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Quick Create</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Create Resource
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push("/projects/new")}
            className="cursor-pointer"
          >
            <FolderKanban className="mr-2 h-4 w-4 text-earth-terracotta" />
            <span>New Project</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenTask} className="cursor-pointer">
            <CheckSquare className="mr-2 h-4 w-4 text-earth-olive" />
            <span>New Task</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenNote} className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4 text-earth-charcoal dark:text-earth-ivory" />
            <span>New Research Note</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleOpenDiagram} className="cursor-pointer">
            <Network className="mr-2 h-4 w-4 text-earth-terracotta-dark dark:text-earth-terracotta" />
            <span>New Diagram</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Task Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmitTask}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-earth-olive" />
                <span>Create Research Task</span>
              </DialogTitle>
              <DialogDescription>
                Track a field survey milestone, laboratory protocol, or sample collection.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-project" required>
                  Assign to Project
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger id="task-project">
                    <SelectValue placeholder="Choose Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-title" required>
                  Task Title
                </Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Inspect soil moisture dataloggers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as TaskPriority)}
                  >
                    <SelectTrigger id="task-priority">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="task-due-date">Target Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-desc">Description (Optional)</Label>
                <Textarea
                  id="task-desc"
                  placeholder="Sampling protocol details, tool IDs, GPS markers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTaskOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmitNote}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-earth-charcoal dark:text-earth-ivory" />
                <span>Log Research Note</span>
              </DialogTitle>
              <DialogDescription>
                Record field observations, specimen characteristics, or ambient anomalies.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="note-project" required>
                  Project
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger id="note-project">
                    <SelectValue placeholder="Choose Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note-title" required>
                  Note Title
                </Label>
                <Input
                  id="note-title"
                  placeholder="e.g. Mycorrhizal spore density along quadrant 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                <Input
                  id="note-tags"
                  placeholder="Canopy, Hydrology, Phenology"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note-content">Observations</Label>
                <Textarea
                  id="note-content"
                  placeholder="Document findings, weather conditions, sensor values..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNoteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Diagram Dialog */}
      <Dialog open={isDiagramOpen} onOpenChange={setIsDiagramOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmitDiagram}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-earth-terracotta" />
                <span>Initialize Diagram</span>
              </DialogTitle>
              <DialogDescription>
                Create a visual topology model for ecological or hydrological dynamics.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="diag-project" required>
                  Project
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger id="diag-project">
                    <SelectValue placeholder="Choose Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diag-title" required>
                  Diagram Title
                </Label>
                <Input
                  id="diag-title"
                  placeholder="e.g. Trophic Interaction Web Topology"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diag-type">Diagram Model</Label>
                <Select
                  value={diagramType}
                  onValueChange={(v) => setDiagramType(v as Diagram["type"])}
                >
                  <SelectTrigger id="diag-type">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecosystem">Ecosystem Flowchart</SelectItem>
                    <SelectItem value="canopy">Canopy Stratification</SelectItem>
                    <SelectItem value="soil_profile">Soil Profile Matrix</SelectItem>
                    <SelectItem value="flowchart">Process Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDiagramOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Draft Diagram</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
