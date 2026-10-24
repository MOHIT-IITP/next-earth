"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { TaskPriority, TaskType, KanbanColumn } from "@/services/types";
import { CheckSquare, Sparkles } from "lucide-react";

interface CreateTaskFromNoteDialogProps {
  projectId: string;
  noteId: string;
  noteTitle: string;
  selectedText?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (taskId: string) => void;
}

export function CreateTaskFromNoteDialog({
  projectId,
  noteId,
  noteTitle,
  selectedText = "",
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskFromNoteDialogProps) {
  const [columns, setColumns] = React.useState<KanbanColumn[]>([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [columnId, setColumnId] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [type, setType] = React.useState<TaskType>("research");
  const [dueDate, setDueDate] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const cols = EarthService.getColumns(projectId);
      setColumns(cols);
      if (cols.length > 0) setColumnId(cols[1]?.id || cols[0].id);

      if (selectedText.trim()) {
        const lines = selectedText.trim().split("\n");
        setTitle(lines[0].replace(/^#+\s*/, "").slice(0, 80));
        setDescription(
          lines.length > 1
            ? lines.slice(1).join("\n").trim()
            : `Derived from note: "${noteTitle}"`
        );
      } else {
        setTitle(`Follow-up: ${noteTitle}`);
        setDescription(`Action item originating from note: "${noteTitle}"`);
      }
    }
  }, [open, projectId, selectedText, noteTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please specify a task title.");
      return;
    }

    const created = EarthService.createTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      columnId: columnId || undefined,
      priority,
      type,
      dueDate: dueDate || undefined,
      linkedNoteIds: [noteId],
    });

    // Auto attach to note
    EarthService.attachTaskToNote(noteId, created.id);

    toast.success("Task Created & Linked", {
      description: `"${created.title}" is now tracked in your project backlog.`,
    });

    onTaskCreated(created.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-earth-olive" />
              <span>Create Task from Note</span>
            </DialogTitle>
            <DialogDescription>
              Converts selected note content or creates a linked research milestone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="from-note-task-title" required>
                Task Title
              </Label>
              <Input
                id="from-note-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from-note-col">Stage Column</Label>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger id="from-note-col">
                    <SelectValue placeholder="Column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="from-note-priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as TaskPriority)}
                >
                  <SelectTrigger id="from-note-priority">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from-note-type">Work Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as TaskType)}
                >
                  <SelectTrigger id="from-note-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="chore">Chore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="from-note-date">Due Date</Label>
                <Input
                  id="from-note-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="from-note-desc">Description</Label>
              <Textarea
                id="from-note-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
