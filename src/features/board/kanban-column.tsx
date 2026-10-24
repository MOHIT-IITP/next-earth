"use client";

import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  FolderInput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "./task-card";
import { Task, KanbanColumn } from "@/services/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: KanbanColumn;
  allColumns: KanbanColumn[];
  tasks: Task[];
  columnIndex: number;
  totalColumns: number;
  onOpenDetail: (task: Task) => void;
  onMoveToColumn: (taskId: string, targetColumnId: string, order?: number) => void;
  onDuplicateTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (columnId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onDeleteColumn: (columnId: string, targetMigrateColumnId?: string) => void;
}

export function ColumnView({
  column,
  allColumns,
  tasks,
  columnIndex,
  totalColumns,
  onOpenDetail,
  onMoveToColumn,
  onDuplicateTask,
  onDeleteTask,
  onQuickAddTask,
  onRenameColumn,
  onMoveColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(column.title);

  // Column deletion safeguard state
  const [isDeleteSafeModalOpen, setIsDeleteSafeModalOpen] = React.useState(false);
  const [migrateColumnId, setMigrateColumnId] = React.useState<string>("");

  const otherColumns = allColumns.filter((c) => c.id !== column.id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if leaving column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dataString = e.dataTransfer.getData("text/plain");
    if (!dataString) return;

    try {
      const { taskId } = JSON.parse(dataString);
      if (taskId) {
        onMoveToColumn(taskId, column.id);
      }
    } catch {
      // Ignore invalid data
    }
  };

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== column.title) {
      onRenameColumn(column.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDeleteClick = () => {
    if (tasks.length > 0) {
      // Column has tasks! Open migration safeguard modal
      setMigrateColumnId(otherColumns[0]?.id || "");
      setIsDeleteSafeModalOpen(true);
    } else {
      // Empty column can be safely removed directly
      onDeleteColumn(column.id);
    }
  };

  const handleConfirmSafeguardDelete = () => {
    onDeleteColumn(column.id, migrateColumnId);
    setIsDeleteSafeModalOpen(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col w-[310px] min-w-[310px] max-w-[310px] rounded-2xl border border-border/80 bg-muted/40 p-3 transition-colors duration-200 shrink-0 select-none",
        isDragOver && "border-earth-terracotta bg-earth-terracotta-light/20 dark:bg-earth-terracotta-light/10 ring-2 ring-earth-terracotta/40"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setTitleInput(column.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="h-7 text-xs font-serif font-medium bg-background"
            />
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="font-serif text-base font-medium text-foreground tracking-tight truncate cursor-pointer hover:text-earth-terracotta transition-colors"
              title="Click to rename column"
            >
              {column.title}
            </h3>
          )}

          <Badge variant="muted" size="sm" className="font-mono text-[10px] px-1.5 py-0 shrink-0">
            {tasks.length}
          </Badge>
        </div>

        {/* Column Actions Menu */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onQuickAddTask(column.id)}
            className="h-7 w-7 text-muted-foreground hover:text-earth-terracotta"
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Column settings"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                <span>Rename Column</span>
              </DropdownMenuItem>

              {columnIndex > 0 && (
                <DropdownMenuItem onClick={() => onMoveColumn(column.id, "left")}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  <span>Move Left</span>
                </DropdownMenuItem>
              )}

              {columnIndex < totalColumns - 1 && (
                <DropdownMenuItem onClick={() => onMoveColumn(column.id, "right")}>
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  <span>Move Right</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDeleteClick}
                disabled={allColumns.length <= 1}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Delete Column</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[calc(100vh-250px)] pr-0.5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/80 rounded-xl bg-card/20">
            <p className="text-xs text-muted-foreground">No tasks in {column.title}</p>
            <button
              type="button"
              onClick={() => onQuickAddTask(column.id)}
              className="mt-2 text-xs text-earth-terracotta hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Plus className="h-3 w-3" />
              Add task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={allColumns}
              onOpenDetail={onOpenDetail}
              onMoveToColumn={onMoveToColumn}
              onDuplicate={onDuplicateTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      {/* Quick Add Card Button at bottom */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onQuickAddTask(column.id)}
        className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground justify-start gap-1.5 h-8 border border-transparent hover:border-border/60"
      >
        <Plus className="h-3.5 w-3.5 text-earth-terracotta" />
        <span>Add task</span>
      </Button>

      {/* Column Deletion Safeguard Dialog */}
      <Dialog open={isDeleteSafeModalOpen} onOpenChange={setIsDeleteSafeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FolderInput className="h-5 w-5 text-earth-terracotta" />
              <span>Migrate Tasks Before Deleting Column</span>
            </DialogTitle>
            <DialogDescription>
              Column &ldquo;{column.title}&rdquo; currently contains {tasks.length} task(s).
              Select a destination column to migrate these tasks so no work is lost.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <label className="text-xs font-medium">Destination Column</label>
            <Select value={migrateColumnId} onValueChange={setMigrateColumnId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination column" />
              </SelectTrigger>
              <SelectContent>
                {otherColumns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSafeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!migrateColumnId}
              onClick={handleConfirmSafeguardDelete}
            >
              Migrate Tasks &amp; Delete Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
