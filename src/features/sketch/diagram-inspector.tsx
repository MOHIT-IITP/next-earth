"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Calendar,
  X,
  Share2,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Diagram, Task, Note, TaskPriority, TaskType } from "@/services/types";
import { EarthService } from "@/services/earth-service";
import { CrossModuleLinkDialog } from "@/features/relations/cross-module-link-dialog";
import { cn } from "@/lib/utils";

interface DiagramInspectorProps {
  projectId: string;
  diagram: Diagram;
  onUpdateMetadata: (updates: Partial<Diagram>) => void;
  onClose: () => void;
  className?: string;
}

export function DiagramInspector({
  projectId,
  diagram,
  onUpdateMetadata,
  onClose,
  className,
}: DiagramInspectorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<TaskPriority>("medium");
  const [newTaskType, setNewTaskType] = React.useState<TaskType>("feature");

  // New note form state
  const [newNoteTitle, setNewNoteTitle] = React.useState("");

  // Retrieve linked tasks & notes
  const allTasks = EarthService.getTasks(projectId);
  const allNotes = EarthService.getNotes(projectId);

  const linkedTasks = allTasks.filter((t) =>
    diagram.linkedTaskIds?.includes(t.id)
  );
  const linkedNotes = allNotes.filter((n) =>
    diagram.linkedNoteIds?.includes(n.id)
  );

  const handleAttachTask = (taskId: string) => {
    EarthService.attachTaskToDiagram(diagram.id, taskId);
    onUpdateMetadata({
      linkedTaskIds: Array.from(new Set([...(diagram.linkedTaskIds || []), taskId])),
    });
  };

  const handleDetachTask = (taskId: string) => {
    EarthService.detachTaskFromDiagram(diagram.id, taskId);
    onUpdateMetadata({
      linkedTaskIds: (diagram.linkedTaskIds || []).filter((id) => id !== taskId),
    });
  };

  const handleAttachNote = (noteId: string) => {
    EarthService.attachNoteToDiagram(diagram.id, noteId);
    onUpdateMetadata({
      linkedNoteIds: Array.from(new Set([...(diagram.linkedNoteIds || []), noteId])),
    });
  };

  const handleDetachNote = (noteId: string) => {
    EarthService.detachNoteFromDiagram(diagram.id, noteId);
    onUpdateMetadata({
      linkedNoteIds: (diagram.linkedNoteIds || []).filter((id) => id !== noteId),
    });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const columns = EarthService.getColumns(projectId);
    const defaultCol = columns[0]?.id || "col-backlog";

    const created = EarthService.createTask({
      projectId,
      columnId: defaultCol,
      title: newTaskTitle.trim(),
      description: `Implementation task created from architecture diagram: ${diagram.title}`,
      type: newTaskType,
      priority: newTaskPriority,
      linkedDiagramIds: [diagram.id],
      labels: ["Architecture", "System-Design"],
    });

    handleAttachTask(created.id);
    setNewTaskTitle("");
    setIsNewTaskOpen(false);
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    const created = EarthService.createNote({
      projectId,
      title: newNoteTitle.trim(),
      content: `# ${newNoteTitle.trim()}\n\nTechnical specification and architecture notes for **${diagram.title}**.\n\n## Component Breakdown\n- Review node topology and data contracts\n- Confirm latency requirements and partition tolerances\n`,
      tags: ["Architecture", "RFC"],
      linkedDiagramIds: [diagram.id],
    });

    handleAttachNote(created.id);
    setNewNoteTitle("");
    setIsNewNoteOpen(false);
  };

  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(diagram.canvasData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${diagram.title.toLowerCase().replace(/\s+/g, "-")}-sketch.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xs w-80 max-h-[calc(100vh-200px)] overflow-hidden",
          className
        )}
      >
        <div className="flex items-center justify-between p-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-earth-olive" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Diagram Context
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="p-3.5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Section */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Diagram Title
              </label>
              <Input
                value={diagram.title}
                onChange={(e) => onUpdateMetadata({ title: e.target.value })}
                className="h-8 text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Description / Purpose
              </label>
              <Textarea
                value={diagram.description || ""}
                onChange={(e) => onUpdateMetadata({ description: e.target.value })}
                className="min-h-[60px] text-xs resize-none"
                placeholder="High-level architecture overview..."
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
              <span>Elements: {diagram.nodeCount || 0} nodes, {diagram.edgeCount || 0} links</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-earth-terracotta hover:text-earth-terracotta hover:bg-earth-terracotta/10"
                onClick={handleExportJson}
              >
                <Download className="h-3 w-3 mr-1" /> Export JSON
              </Button>
            </div>
          </div>

          {/* Linked Tasks Section */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-earth-olive" />
                Linked Tasks ({linkedTasks.length})
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-earth-olive"
                  onClick={() => setIsNewTaskOpen(true)}
                  title="Create new implementation task"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {linkedTasks.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                No linked tasks. Create or link tasks representing this architecture.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                {linkedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded border bg-card/60 text-xs hover:border-earth-olive/50 transition-colors group"
                  >
                    <Link
                      href={`/projects/${projectId}/board`}
                      className="flex-1 min-w-0 pr-2 hover:text-earth-olive truncate flex items-center gap-1.5"
                    >
                      <span className="truncate font-medium">{task.title}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                        {task.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDetachTask(task.id)}
                        title="Unlink task"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Notes Section */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-earth-terracotta" />
                Linked Notes ({linkedNotes.length})
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-earth-terracotta"
                  onClick={() => setIsNewNoteOpen(true)}
                  title="Create new linked RFC or note"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {linkedNotes.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                No linked notes. Attach technical specifications or design documents.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                {linkedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-2 rounded border bg-card/60 text-xs hover:border-earth-terracotta/50 transition-colors group"
                  >
                    <Link
                      href={`/projects/${projectId}/notes`}
                      className="flex-1 min-w-0 pr-2 hover:text-earth-terracotta truncate flex items-center gap-1.5"
                    >
                      <span className="truncate font-medium">{note.title}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDetachNote(note.id)}
                      title="Unlink note"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Link Existing Button */}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => setIsLinkDialogOpen(true)}
            >
              <Share2 className="h-3 w-3 mr-1.5" />
              Link Existing Task or Note
            </Button>
          </div>
        </div>
      </div>

      {/* Cross-Module Linking Dialog */}
      {isLinkDialogOpen && (
        <CrossModuleLinkDialog
          projectId={projectId}
          sourceType="diagram"
          sourceId={diagram.id}
          sourceTitle={diagram.title}
          open={isLinkDialogOpen}
          onOpenChange={setIsLinkDialogOpen}
          onRelationshipsChanged={() => {
            const updated = EarthService.getDiagramById(diagram.id);
            if (updated) onUpdateMetadata(updated);
          }}
        />
      )}

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">
              New Implementation Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">Task Title</label>
              <Input
                placeholder="e.g. Implement Kafka cluster ingestion layer"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Type</label>
                <Select
                  value={newTaskType}
                  onValueChange={(v: TaskType) => setNewTaskType(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="chore">Chore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Priority</label>
                <Select
                  value={newTaskPriority}
                  onValueChange={(v: TaskPriority) => setNewTaskPriority(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-earth-olive hover:bg-earth-olive/90 text-white"
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim()}
            >
              Create & Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Note Dialog */}
      <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-serif">
              New Technical Note / RFC
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-muted-foreground">Note Title</label>
              <Input
                placeholder="e.g. Ingress & Sharding Design RFC"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
              onClick={handleCreateNote}
              disabled={!newNoteTitle.trim()}
            >
              Create & Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
