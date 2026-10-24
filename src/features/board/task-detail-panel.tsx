"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Tag,
  CheckSquare,
  FileText,
  Network,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  Paperclip,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { EarthService } from "@/services/earth-service";
import {
  Task,
  TaskPriority,
  TaskType,
  KanbanColumn,
  Note,
  Diagram,
  ChecklistItem,
} from "@/services/types";
import { CrossModuleLinkDialog } from "@/features/relations/cross-module-link-dialog";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
  task: Task | null;
  columns: KanbanColumn[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export function TaskDetailPanel({
  task,
  columns,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskDetailPanelProps) {
  if (!task) return null;

  return (
    <TaskDetailContent
      key={task.id}
      task={task}
      columns={columns}
      open={open}
      onOpenChange={onOpenChange}
      onTaskUpdated={onTaskUpdated}
    />
  );
}

function TaskDetailContent({
  task,
  columns,
  open,
  onOpenChange,
  onTaskUpdated,
}: {
  task: Task;
  columns: KanbanColumn[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}) {
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description || "");
  const [columnId, setColumnId] = React.useState(task.columnId);
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [type, setType] = React.useState<TaskType>(task.type);
  const [dueDate, setDueDate] = React.useState(task.dueDate || "");
  const [labels, setLabels] = React.useState<string[]>(task.labels || []);
  const [newLabelInput, setNewLabelInput] = React.useState("");

  // Checklists
  const [checklists, setChecklists] = React.useState<ChecklistItem[]>(
    task.checklists || []
  );
  const [newChecklistInput, setNewChecklistInput] = React.useState("");

  // Cross-module Links
  const [linkedNoteIds, setLinkedNoteIds] = React.useState<string[]>(
    task.linkedNoteIds || []
  );
  const [linkedDiagramIds, setLinkedDiagramIds] = React.useState<string[]>(
    task.linkedDiagramIds || []
  );

  // Available project notes & diagrams for attaching
  const [availableNotes, setAvailableNotes] = React.useState<Note[]>([]);
  const [availableDiagrams, setAvailableDiagrams] = React.useState<Diagram[]>([]);

  // Dialogs for creating new note/diagram directly from task
  const [isAttachModalOpen, setIsAttachModalOpen] = React.useState(false);
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = React.useState(false);
  const [isCreateDiagramModalOpen, setIsCreateDiagramModalOpen] = React.useState(false);

  // New Note state
  const [newNoteTitle, setNewNoteTitle] = React.useState("");
  const [newNoteContent, setNewNoteContent] = React.useState("");
  // New Diagram state
  const [newDiagramTitle, setNewDiagramTitle] = React.useState("");
  const [newDiagramType, setNewDiagramType] = React.useState<Diagram["type"]>("ecosystem");

  const [attachSearch, setAttachSearch] = React.useState("");

  React.useEffect(() => {
    setAvailableNotes(EarthService.getNotes(task.projectId));
    setAvailableDiagrams(EarthService.getDiagrams(task.projectId));
  }, [task.projectId]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }

    EarthService.updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      type,
      dueDate: dueDate || undefined,
      labels,
      checklists,
      linkedNoteIds,
      linkedDiagramIds,
    });

    onTaskUpdated();
    toast.success("Task Saved", { description: "Task changes applied." });
    onOpenChange(false);
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLabelInput.trim()) {
      e.preventDefault();
      const clean = newLabelInput.trim().replace(/^#/, "");
      if (!labels.includes(clean)) {
        setLabels([...labels, clean]);
      }
      setNewLabelInput("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistInput.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistInput.trim(),
      completed: false,
    };
    setChecklists([...checklists, newItem]);
    setNewChecklistInput("");
  };

  const handleToggleChecklist = (id: string) => {
    setChecklists(
      checklists.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c
      )
    );
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists(checklists.filter((c) => c.id !== id));
  };

  const handleAttachNote = (noteId: string) => {
    if (!linkedNoteIds.includes(noteId)) {
      setLinkedNoteIds([...linkedNoteIds, noteId]);
      EarthService.attachNoteToTask(task.id, noteId);
      onTaskUpdated();
      toast.success("Note Linked", { description: "Note attached to task." });
    }
  };

  const handleDetachNote = (noteId: string) => {
    setLinkedNoteIds(linkedNoteIds.filter((id) => id !== noteId));
    EarthService.detachNoteFromTask(task.id, noteId);
    onTaskUpdated();
  };

  const handleAttachDiagram = (diagramId: string) => {
    if (!linkedDiagramIds.includes(diagramId)) {
      setLinkedDiagramIds([...linkedDiagramIds, diagramId]);
      EarthService.attachDiagramToTask(task.id, diagramId);
      onTaskUpdated();
      toast.success("Diagram Linked", { description: "Diagram attached to task." });
    }
  };

  const handleDetachDiagram = (diagramId: string) => {
    setLinkedDiagramIds(linkedDiagramIds.filter((id) => id !== diagramId));
    EarthService.detachDiagramFromTask(task.id, diagramId);
    onTaskUpdated();
  };

  const handleCreateNoteDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const note = EarthService.createNote({
      projectId: task.projectId,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim() || `Field observations for ${task.title}.`,
      tags: ["Linked Note", ...labels],
    });

    handleAttachNote(note.id);
    setIsCreateNoteModalOpen(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setAvailableNotes(EarthService.getNotes(task.projectId));
  };

  const handleCreateDiagramDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagramTitle.trim()) return;

    const diag = EarthService.createDiagram({
      projectId: task.projectId,
      title: newDiagramTitle.trim(),
      type: newDiagramType,
    });

    handleAttachDiagram(diag.id);
    setIsCreateDiagramModalOpen(false);
    setNewDiagramTitle("");
    setAvailableDiagrams(EarthService.getDiagrams(task.projectId));
  };

  // Find linked objects
  const linkedNotes = availableNotes.filter((n) => linkedNoteIds.includes(n.id));
  const linkedDiagrams = availableDiagrams.filter((d) => linkedDiagramIds.includes(d.id));

  // Search unattached
  const unattachedNotes = availableNotes.filter(
    (n) =>
      !linkedNoteIds.includes(n.id) &&
      n.title.toLowerCase().includes(attachSearch.toLowerCase())
  );
  const unattachedDiagrams = availableDiagrams.filter(
    (d) =>
      !linkedDiagramIds.includes(d.id) &&
      d.title.toLowerCase().includes(attachSearch.toLowerCase())
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-border/80 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Task Specification
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ID: {task.id}
              </span>
            </div>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-serif text-2xl font-normal tracking-tight h-auto py-1 px-2 border-transparent hover:border-border focus-visible:border-primary"
              placeholder="Task Title"
            />
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadata Controls: Column, Priority, Type, Due Date */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border/70 bg-muted/30">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Column Status</Label>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger className="h-8 text-xs bg-background">
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
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as TaskPriority)}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
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
                <Label className="text-xs text-muted-foreground">Work Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as TaskType)}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
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
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description-field" className="text-xs font-medium">
                Research Protocol &amp; Instructions
              </Label>
              <Textarea
                id="task-description-field"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Document methodology, telemetry guidelines, or specimen inspection parameters..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Labels Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Categorical Labels</Label>
                <span className="text-[10px] text-muted-foreground">Press Enter to add</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border bg-background">
                {labels.map((l) => (
                  <Badge
                    key={l}
                    variant="muted"
                    size="sm"
                    className="gap-1 pr-1 text-xs"
                  >
                    <span>#{l}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(l)}
                      className="hover:text-destructive rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyDown={handleAddLabel}
                  placeholder="+ Add label..."
                  className="text-xs bg-transparent border-none outline-none focus:ring-0 p-1 flex-1 min-w-[100px]"
                />
              </div>
            </div>

            {/* Checklists Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-earth-olive" />
                  <Label className="text-xs font-medium">
                    Checklist ({checklists.filter((c) => c.completed).length}/{checklists.length})
                  </Label>
                </div>
              </div>

              <div className="space-y-1.5">
                {checklists.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/60 bg-card/60 text-xs"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="rounded border-border text-earth-terracotta focus:ring-earth-terracotta h-3.5 w-3.5"
                      />
                      <span className={cn(item.completed && "line-through text-muted-foreground")}>
                        {item.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(item.id)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <Input
                  value={newChecklistInput}
                  onChange={(e) => setNewChecklistInput(e.target.value)}
                  placeholder="Add a checklist step..."
                  className="h-8 text-xs"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </form>
            </div>

            {/* Related Items Section (Linked Notes & Diagrams) */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-serif text-sm font-medium text-foreground">
                    Related Items
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Attached research notes and topology diagrams.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAttachModalOpen(true)}
                    className="h-7 text-xs gap-1"
                  >
                    <Paperclip className="h-3 w-3" />
                    Attach
                  </Button>
                </div>
              </div>

              {/* Linked Notes List */}
              {linkedNotes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                    Linked Notes ({linkedNotes.length})
                  </span>
                  {linkedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between p-2.5 rounded-lg border border-border bg-card text-xs gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-earth-charcoal dark:text-earth-ivory shrink-0 mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                          <Link
                            href={`/projects/${task.projectId}/notes`}
                            className="font-medium text-foreground hover:text-earth-terracotta truncate flex items-center gap-1 group/item"
                          >
                            <span className="truncate">{note.title}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </Link>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{note.content}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDetachNote(note.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded"
                        title="Detach Note"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Diagrams List */}
              {linkedDiagrams.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                    Linked Diagrams ({linkedDiagrams.length})
                  </span>
                  {linkedDiagrams.map((diag) => (
                    <div
                      key={diag.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-earth-cream/30 dark:bg-card text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Network className="h-4 w-4 text-earth-terracotta shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <Link
                            href={`/projects/${task.projectId}/sketch`}
                            className="font-medium text-foreground hover:text-earth-olive truncate flex items-center gap-1 group/item"
                          >
                            <span className="truncate">{diag.title}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">
                            {diag.type.replace("_", " ")} &bull; {diag.nodeCount} nodes
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDetachDiagram(diag.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded"
                        title="Detach Diagram"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {linkedNotes.length === 0 && linkedDiagrams.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                  No notes or diagrams currently attached.
                </div>
              )}

              {/* Direct creation buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsCreateNoteModalOpen(true)}
                  className="text-xs h-7 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  New Note for Task
                </Button>

                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsCreateDiagramModalOpen(true)}
                  className="text-xs h-7 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  New Diagram for Task
                </Button>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="p-4 border-t border-border bg-card/60 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reusable Cross-Module Linking Dialog */}
      {isAttachModalOpen && (
        <CrossModuleLinkDialog
          projectId={task.projectId}
          sourceType="task"
          sourceId={task.id}
          sourceTitle={task.title}
          open={isAttachModalOpen}
          onOpenChange={setIsAttachModalOpen}
          onRelationshipsChanged={() => {
            const updated = EarthService.getTaskById(task.id);
            if (updated) {
              setLinkedNoteIds(updated.linkedNoteIds || []);
              setLinkedDiagramIds(updated.linkedDiagramIds || []);
            }
            onTaskUpdated();
          }}
        />
      )}

      {/* Create Note Modal Directly from Task */}
      <Dialog open={isCreateNoteModalOpen} onOpenChange={setIsCreateNoteModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreateNoteDirectly}>
            <DialogHeader>
              <DialogTitle>Create &amp; Link Research Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="direct-note-title" required>Note Title</Label>
                <Input
                  id="direct-note-title"
                  placeholder="e.g. Field protocol observations"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="direct-note-content">Note Content</Label>
                <Textarea
                  id="direct-note-content"
                  rows={3}
                  placeholder="Record findings for this specific task..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create &amp; Attach</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Diagram Modal Directly from Task */}
      <Dialog open={isCreateDiagramModalOpen} onOpenChange={setIsCreateDiagramModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreateDiagramDirectly}>
            <DialogHeader>
              <DialogTitle>Create &amp; Link Diagram</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="direct-diag-title" required>Diagram Title</Label>
                <Input
                  id="direct-diag-title"
                  placeholder="e.g. Sensor Array Topology"
                  value={newDiagramTitle}
                  onChange={(e) => setNewDiagramTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="direct-diag-type">Diagram Model</Label>
                <Select
                  value={newDiagramType}
                  onValueChange={(v) => setNewDiagramType(v as Diagram["type"])}
                >
                  <SelectTrigger id="direct-diag-type">
                    <SelectValue placeholder="Model" />
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
              <Button type="button" variant="outline" onClick={() => setIsCreateDiagramModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create &amp; Attach</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
