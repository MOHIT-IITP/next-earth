"use client";

import * as React from "react";
import {
  Search,
  CheckSquare,
  Network,
  Paperclip,
  Check,
  Plus,
  Layers,
} from "lucide-react";
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
import { Task, Diagram } from "@/services/types";
import { cn } from "@/lib/utils";

interface RelatedItemsPickerDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachedTaskIds: string[];
  attachedDiagramIds: string[];
  onAttachTask: (taskId: string) => void;
  onAttachDiagram: (diagramId: string) => void;
}

export function RelatedItemsPickerDialog({
  projectId,
  open,
  onOpenChange,
  attachedTaskIds,
  attachedDiagramIds,
  onAttachTask,
  onAttachDiagram,
}: RelatedItemsPickerDialogProps) {
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "tasks" | "diagrams">("all");

  const [availableTasks, setAvailableTasks] = React.useState<Task[]>([]);
  const [availableDiagrams, setAvailableDiagrams] = React.useState<Diagram[]>([]);

  React.useEffect(() => {
    if (open) {
      setAvailableTasks(EarthService.getTasks(projectId));
      setAvailableDiagrams(EarthService.getDiagrams(projectId));
      setQuery("");
    }
  }, [open, projectId]);

  const filteredTasks = availableTasks.filter((task) => {
    if (typeFilter === "diagrams") return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q))
    );
  });

  const filteredDiagrams = availableDiagrams.filter((diag) => {
    if (typeFilter === "tasks") return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      diag.title.toLowerCase().includes(q) ||
      diag.type.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-earth-terracotta" />
            <span>Attach Related Project Items</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by task title, diagram name, or type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
              autoFocus
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Filter:</span>
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors",
                  typeFilter === "all"
                    ? "bg-earth-cream text-earth-charcoal font-medium dark:bg-muted dark:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("tasks")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors",
                  typeFilter === "tasks"
                    ? "bg-earth-cream text-earth-charcoal font-medium dark:bg-muted dark:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tasks ({availableTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("diagrams")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors",
                  typeFilter === "diagrams"
                    ? "bg-earth-cream text-earth-charcoal font-medium dark:bg-muted dark:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Diagrams ({availableDiagrams.length})
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-border/60">
            {/* Tasks Group */}
            {typeFilter !== "diagrams" && filteredTasks.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Field Tasks
                </span>
                <div className="space-y-1">
                  {filteredTasks.map((task) => {
                    const isAttached = attachedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border border-border/70 text-xs transition-colors",
                          isAttached ? "bg-muted/40 opacity-70" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <CheckSquare className="h-4 w-4 text-earth-olive shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {task.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {task.priority} priority &bull; {task.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isAttached ? "ghost" : "outline"}
                          disabled={isAttached}
                          onClick={() => onAttachTask(task.id)}
                          className="h-7 text-xs shrink-0"
                        >
                          {isAttached ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-earth-olive" />
                              Attached
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Attach
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diagrams Group */}
            {typeFilter !== "tasks" && filteredDiagrams.length > 0 && (
              <div className="space-y-1.5 pt-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Topology Diagrams
                </span>
                <div className="space-y-1">
                  {filteredDiagrams.map((diag) => {
                    const isAttached = attachedDiagramIds.includes(diag.id);
                    return (
                      <div
                        key={diag.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border border-border/70 text-xs transition-colors",
                          isAttached ? "bg-muted/40 opacity-70" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <Network className="h-4 w-4 text-earth-terracotta shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {diag.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              {diag.type.replace("_", " ")} &bull; {diag.nodeCount} nodes
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isAttached ? "ghost" : "outline"}
                          disabled={isAttached}
                          onClick={() => onAttachDiagram(diag.id)}
                          className="h-7 text-xs shrink-0"
                        >
                          {isAttached ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-earth-olive" />
                              Attached
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Attach
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredTasks.length === 0 && filteredDiagrams.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No matching items found.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
