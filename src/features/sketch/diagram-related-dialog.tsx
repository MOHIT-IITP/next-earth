"use client";

import * as React from "react";
import { Search, CheckSquare, FileText, Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EarthService } from "@/services/earth-service";
import { Task, Note } from "@/services/types";
import { cn } from "@/lib/utils";

interface DiagramRelatedDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachedTaskIds: string[];
  attachedNoteIds: string[];
  onAttachTask: (taskId: string) => void;
  onAttachNote: (noteId: string) => void;
}

export function DiagramRelatedDialog({
  projectId,
  open,
  onOpenChange,
  attachedTaskIds,
  attachedNoteIds,
  onAttachTask,
  onAttachNote,
}: DiagramRelatedDialogProps) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "tasks" | "notes">("all");
  const [availableTasks, setAvailableTasks] = React.useState<Task[]>([]);
  const [availableNotes, setAvailableNotes] = React.useState<Note[]>([]);

  React.useEffect(() => {
    if (open) {
      setAvailableTasks(EarthService.getTasks(projectId));
      setAvailableNotes(EarthService.getNotes(projectId));
      setQuery("");
    }
  }, [open, projectId]);

  const filteredTasks = availableTasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredNotes = availableNotes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-base font-serif">
            Link Project Items to Diagram
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks and notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
            <div className="flex rounded-md border p-0.5 bg-muted/40 text-xs">
              {(["all", "tasks", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs capitalize transition-colors",
                    filter === tab
                      ? "bg-background text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {(filter === "all" || filter === "tasks") && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Project Tasks ({filteredTasks.length})
                </div>
                {filteredTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1 italic">
                    No matching tasks found.
                  </p>
                ) : (
                  filteredTasks.map((task) => {
                    const isAttached = attachedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs transition-colors",
                          isAttached
                            ? "bg-earth-olive/10 border-earth-olive/30"
                            : "hover:bg-accent/60"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <CheckSquare className="h-3.5 w-3.5 text-earth-olive shrink-0" />
                          <span className="font-medium truncate">{task.title}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {task.priority}
                          </Badge>
                        </div>
                        {isAttached ? (
                          <div className="flex items-center gap-1 text-[11px] text-earth-olive font-medium px-2 py-0.5">
                            <Check className="h-3 w-3" /> Linked
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => onAttachTask(task.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Link
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {(filter === "all" || filter === "notes") && (
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Project Notes ({filteredNotes.length})
                </div>
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1 italic">
                    No matching notes found.
                  </p>
                ) : (
                  filteredNotes.map((note) => {
                    const isAttached = attachedNoteIds.includes(note.id);
                    return (
                      <div
                        key={note.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-xs transition-colors",
                          isAttached
                            ? "bg-earth-terracotta/10 border-earth-terracotta/30"
                            : "hover:bg-accent/60"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                          <span className="font-medium truncate">{note.title}</span>
                        </div>
                        {isAttached ? (
                          <div className="flex items-center gap-1 text-[11px] text-earth-terracotta font-medium px-2 py-0.5">
                            <Check className="h-3 w-3" /> Linked
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => onAttachNote(note.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Link
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
