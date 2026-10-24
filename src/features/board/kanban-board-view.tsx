"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Columns,
  RotateCcw,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Layers,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { ColumnView } from "./kanban-column";
import { TaskDetailPanel } from "./task-detail-panel";
import { BoardFilterBar, BoardFilters } from "./board-filter-bar";
import { AddColumnDialog } from "./add-column-dialog";
import { EarthService } from "@/services/earth-service";
import {
  Project,
  Task,
  KanbanColumn,
  TaskPriority,
  TaskType,
} from "@/services/types";
import { cn } from "@/lib/utils";

const DEFAULT_FILTERS: BoardFilters = {
  search: "",
  columnId: "all",
  priority: "all",
  type: "all",
  label: "all",
  sortBy: "order",
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function KanbanBoardView({ projectId }: { projectId: string }) {
  const [project, setProject] = React.useState<Project | null>(null);
  const [allProjects, setAllProjects] = React.useState<Project[]>([]);
  const [columns, setColumns] = React.useState<KanbanColumn[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);

  // Filtering & Sorting State
  const [filters, setFilters] = React.useState<BoardFilters>(DEFAULT_FILTERS);

  // Selected task for detail panel
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Quick Add task dialog
  const [quickAddColumnId, setQuickAddColumnId] = React.useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = React.useState("");

  // Add column dialog
  const [isAddColumnOpen, setIsAddColumnOpen] = React.useState(false);

  const loadBoardData = React.useCallback(() => {
    const p = EarthService.getProjectById(projectId);
    setProject(p || null);
    setAllProjects(EarthService.getProjects());

    if (p) {
      const cols = EarthService.getColumns(projectId);
      setColumns(cols);
      const t = EarthService.getTasks(projectId);
      setTasks(t);
    }
  }, [projectId]);

  React.useEffect(() => {
    loadBoardData();

    const handleUpdate = () => loadBoardData();
    window.addEventListener("earth-data-updated", handleUpdate);
    return () => window.removeEventListener("earth-data-updated", handleUpdate);
  }, [loadBoardData]);

  if (!project) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl">Project Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The requested territory project does not exist.
        </p>
        <Button asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Projects
          </Link>
        </Button>
      </div>
    );
  }

  // Collect all unique labels for filter dropdown
  const allLabels = Array.from(
    new Set(tasks.flatMap((t) => t.labels || []))
  );

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        task.labels.some((l) => l.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Column filter
    if (filters.columnId !== "all" && task.columnId !== filters.columnId) {
      return false;
    }

    // Priority filter
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && task.type !== filters.type) {
      return false;
    }

    // Label filter
    if (filters.label !== "all" && !task.labels.includes(filters.label)) {
      return false;
    }

    return true;
  });

  // Sort tasks
  const sortTasksList = (list: Task[]) => {
    if (filters.sortBy === "priority") {
      return [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      );
    }
    if (filters.sortBy === "dueDate") {
      return [...list].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }
    if (filters.sortBy === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => a.order - b.order);
  };

  // Drag and drop task move handler with Optimistic Update
  const handleMoveToColumn = (taskId: string, targetColumnId: string, targetOrder?: number) => {
    // Optimistic local state update
    const previousTasks = [...tasks];
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId
          ? {
              ...t,
              columnId: targetColumnId,
              order: targetOrder !== undefined ? targetOrder : t.order,
              status: targetColumnId.toLowerCase().includes("done") ? "completed" : "in_progress",
            }
          : t
      )
    );

    try {
      EarthService.moveTask(taskId, targetColumnId, targetOrder);
      window.dispatchEvent(new Event("earth-data-updated"));
    } catch {
      // Revert if error
      setTasks(previousTasks);
      toast.error("Failed to move task. Reverted changes.");
    }
  };

  // Duplicate task
  const handleDuplicateTask = (taskId: string) => {
    const dup = EarthService.duplicateTask(taskId);
    loadBoardData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Task Duplicated", {
      description: `Created copy "${dup.title}".`,
    });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    EarthService.deleteTask(taskId);
    loadBoardData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.error("Task Removed", { description: "Task deleted from board." });
  };

  // Quick Add task submit
  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim() || !quickAddColumnId) return;

    EarthService.createTask({
      projectId: project.id,
      title: quickAddTitle.trim(),
      columnId: quickAddColumnId,
    });

    setQuickAddTitle("");
    setQuickAddColumnId(null);
    loadBoardData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Task Added", { description: "New card created." });
  };

  // Column management handlers
  const handleAddColumn = (title: string) => {
    EarthService.addColumn(project.id, title);
    loadBoardData();
    toast.success("Column Added", { description: `Column "${title}" created.` });
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    EarthService.updateColumn(project.id, columnId, newTitle);
    loadBoardData();
    toast.success("Column Renamed", { description: `Updated to "${newTitle}".` });
  };

  const handleMoveColumn = (columnId: string, direction: "left" | "right") => {
    const currentIndex = columns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newColumns = [...columns];
    const [moved] = newColumns.splice(currentIndex, 1);
    newColumns.splice(targetIndex, 0, moved);

    EarthService.reorderColumns(
      project.id,
      newColumns.map((c) => c.id)
    );
    loadBoardData();
  };

  const handleDeleteColumn = (columnId: string, targetMigrateColumnId?: string) => {
    try {
      EarthService.removeColumn(project.id, columnId, targetMigrateColumnId);
      loadBoardData();
      toast.success("Column Removed", {
        description: targetMigrateColumnId
          ? "Column removed and tasks safely migrated."
          : "Empty column deleted.",
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cannot delete column.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Board Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-normal text-foreground">
            Task Board
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage workflow stages, reorder tasks, and attach linked research items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddColumnOpen(true)}
            className="gap-1 text-xs h-8"
          >
            <Columns className="h-3.5 w-3.5 text-earth-olive" />
            <span>Add Column</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setQuickAddColumnId(columns[0]?.id || "col-todo")}
            className="gap-1 text-xs h-8 bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <BoardFilterBar
        filters={filters}
        columns={columns}
        allLabels={allLabels}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Horizontal Scrollable Kanban Columns Container */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="inline-flex gap-4 items-start min-h-[580px]">
          {columns.map((column, index) => {
            const columnTasks = sortTasksList(
              filteredTasks.filter((t) => t.columnId === column.id)
            );

            return (
              <ColumnView
                key={column.id}
                column={column}
                allColumns={columns}
                tasks={columnTasks}
                columnIndex={index}
                totalColumns={columns.length}
                onOpenDetail={(t) => {
                  setSelectedTask(t);
                  setIsDetailOpen(true);
                }}
                onMoveToColumn={handleMoveToColumn}
                onDuplicateTask={handleDuplicateTask}
                onDeleteTask={handleDeleteTask}
                onQuickAddTask={(colId) => {
                  setQuickAddColumnId(colId);
                }}
                onRenameColumn={handleRenameColumn}
                onMoveColumn={handleMoveColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            );
          })}

          {/* "+ New Column" Outline Card at the end of board */}
          <button
            type="button"
            onClick={() => setIsAddColumnOpen(true)}
            className="flex flex-col items-center justify-center w-[240px] min-w-[240px] h-[160px] rounded-2xl border-2 border-dashed border-border/80 text-muted-foreground hover:border-earth-terracotta hover:text-earth-terracotta hover:bg-muted/20 transition-all text-xs gap-2 shrink-0 select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-medium">Add Stage Column</span>
          </button>
        </div>
      </div>

      {/* Task Detail Slide-over Panel */}
      <TaskDetailPanel
        task={selectedTask}
        columns={columns}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onTaskUpdated={() => {
          loadBoardData();
          window.dispatchEvent(new Event("earth-data-updated"));
        }}
      />

      {/* Quick Add Task Dialog */}
      <Dialog
        open={!!quickAddColumnId}
        onOpenChange={(open) => !open && setQuickAddColumnId(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleQuickAddSubmit}>
            <DialogHeader>
              <DialogTitle>Quick Add Task</DialogTitle>
              <DialogDescription>
                Adding task to column &ldquo;
                {columns.find((c) => c.id === quickAddColumnId)?.title}
                &rdquo;
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="quick-add-task-title" required>
                  Task Title
                </Label>
                <Input
                  id="quick-add-task-title"
                  placeholder="e.g. Inspect radio collar antenna telemetry"
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickAddColumnId(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Custom Column Dialog */}
      <AddColumnDialog
        open={isAddColumnOpen}
        onOpenChange={setIsAddColumnOpen}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
}
