"use client";

import * as React from "react";
import {
  Clock,
  FileText,
  Network,
  CheckSquare,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  ArrowRight,
  AlertTriangle,
  Bug,
  Sparkles,
  Zap,
  Microscope,
  Wrench,
  MoveRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TaskPriority, TaskType, KanbanColumn } from "@/services/types";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  TaskType,
  { label: string; icon: React.ElementType; color: string }
> = {
  feature: { label: "Feature", icon: Sparkles, color: "text-earth-terracotta bg-earth-terracotta-light dark:bg-earth-terracotta-light/20 dark:text-earth-terracotta" },
  bug: { label: "Bug", icon: Bug, color: "text-destructive bg-destructive/10" },
  enhancement: { label: "Enhancement", icon: Zap, color: "text-earth-olive bg-earth-olive-light dark:bg-earth-olive-light/20 dark:text-earth-olive" },
  research: { label: "Research", icon: Microscope, color: "text-earth-charcoal bg-earth-cream dark:bg-muted dark:text-earth-ivory" },
  chore: { label: "Chore", icon: Wrench, color: "text-muted-foreground bg-muted" },
};

const PRIORITY_BADGE_VARIANT: Record<TaskPriority, "outline" | "terracotta" | "olive" | "destructive" | "default"> = {
  urgent: "destructive",
  high: "terracotta",
  medium: "olive",
  low: "outline",
};

interface TaskCardProps {
  task: Task;
  columns: KanbanColumn[];
  onOpenDetail: (task: Task) => void;
  onMoveToColumn: (taskId: string, targetColumnId: string) => void;
  onDuplicate: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  columns,
  onOpenDetail,
  onMoveToColumn,
  onDuplicate,
  onDelete,
  isDragging = false,
}: TaskCardProps) {
  const typeConfig = TYPE_CONFIG[task.type] || TYPE_CONFIG.research;
  const TypeIcon = typeConfig.icon;

  const isCompleted = task.status === "completed";
  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    new Date(task.dueDate) < new Date("2026-10-24");

  const checklistTotal = task.checklists?.length || 0;
  const checklistCompleted =
    task.checklists?.filter((c) => c.completed).length || 0;

  const linkedNotesCount = task.linkedNoteIds?.length || 0;
  const linkedDiagramsCount = task.linkedDiagramIds?.length || 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id, fromColumnId: task.columnId }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDetail(task)}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-2xs transition-all duration-200 cursor-pointer select-none",
        "hover:border-earth-terracotta/40 hover:shadow-sm hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        isDragging && "opacity-40 border-dashed border-earth-terracotta scale-95",
        isCompleted && "bg-card/60 opacity-80"
      )}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(task);
        }
      }}
      role="button"
      aria-label={`Task: ${task.title}. Priority ${task.priority}. Status ${task.status}.`}
    >
      {/* Top Header Row: Type emblem, Priority, and Quick Actions Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide uppercase",
              typeConfig.color
            )}
          >
            <TypeIcon className="h-3 w-3" />
            <span>{typeConfig.label}</span>
          </span>

          <Badge
            variant={PRIORITY_BADGE_VARIANT[task.priority]}
            size="sm"
            className="text-[10px] uppercase font-mono px-1.5 py-0"
          >
            {task.priority}
          </Badge>
        </div>

        {/* Quick Actions Dropdown Menu (Includes Keyboard Navigation Alternative to Drag & Drop!) */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                aria-label="Task options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => onOpenDetail(task)}>
                <Edit className="mr-2 h-4 w-4 text-earth-terracotta" />
                <span>Open Task Details</span>
              </DropdownMenuItem>

              {/* Accessible Keyboard Move Alternative */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveRight className="mr-2 h-4 w-4 text-earth-olive" />
                  <span>Move to Column</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {columns.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      disabled={col.id === task.columnId}
                      onClick={() => onMoveToColumn(task.id, col.id)}
                    >
                      <span className={col.id === task.columnId ? "font-semibold text-earth-terracotta" : ""}>
                        {col.title} {col.id === task.columnId && "(Current)"}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={() => onDuplicate(task.id)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate Task</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task Title */}
      <h4
        className={cn(
          "font-serif text-base font-normal text-foreground leading-snug line-clamp-2",
          isCompleted && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </h4>

      {/* Labels List */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="inline-block text-[10px] px-1.5 py-0.25 rounded bg-muted/70 text-muted-foreground border border-border/40 font-sans"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Due Date, Checklist progress, Linked Notes & Diagrams */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border/50 mt-1">
        {/* Due Date Indicator */}
        <div>
          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px]",
                isOverdue && "text-destructive font-medium"
              )}
            >
              {isOverdue ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span>{task.dueDate}</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">No due date</span>
          )}
        </div>

        {/* Indicators: Checklist, Notes, Diagrams */}
        <div className="flex items-center gap-2 text-[11px]">
          {checklistTotal > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                checklistCompleted === checklistTotal
                  ? "text-earth-olive font-medium"
                  : "text-muted-foreground"
              )}
              title={`${checklistCompleted} of ${checklistTotal} checklist items completed`}
            >
              <CheckSquare className="h-3 w-3" />
              <span>
                {checklistCompleted}/{checklistTotal}
              </span>
            </span>
          )}

          {linkedNotesCount > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-muted-foreground"
              title={`${linkedNotesCount} research note(s) attached`}
            >
              <FileText className="h-3 w-3" />
              <span>{linkedNotesCount}</span>
            </span>
          )}

          {linkedDiagramsCount > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-muted-foreground"
              title={`${linkedDiagramsCount} diagram(s) linked`}
            >
              <Network className="h-3 w-3" />
              <span>{linkedDiagramsCount}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
