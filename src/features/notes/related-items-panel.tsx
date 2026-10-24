"use client";

import * as React from "react";
import Link from "next/link";
import {
  Tag,
  Paperclip,
  CheckSquare,
  Network,
  Plus,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EarthService } from "@/services/earth-service";
import { Note, Task, Diagram } from "@/services/types";
import { cn } from "@/lib/utils";

interface RelatedItemsPanelProps {
  note: Note;
  selectedText: string;
  onUpdateTags: (tags: string[]) => void;
  onOpenAttachModal: () => void;
  onOpenCreateTaskModal: () => void;
  onOpenCreateDiagramModal: () => void;
  onDetachTask: (taskId: string) => void;
  onDetachDiagram: (diagramId: string) => void;
}

export function RelatedItemsPanel({
  note,
  selectedText,
  onUpdateTags,
  onOpenAttachModal,
  onOpenCreateTaskModal,
  onOpenCreateDiagramModal,
  onDetachTask,
  onDetachDiagram,
}: RelatedItemsPanelProps) {
  const [newTagInput, setNewTagInput] = React.useState("");

  const [attachedTasks, setAttachedTasks] = React.useState<Task[]>([]);
  const [attachedDiagrams, setAttachedDiagrams] = React.useState<Diagram[]>([]);

  React.useEffect(() => {
    const tasks = EarthService.getTasks(note.projectId).filter((t) =>
      note.linkedTaskIds?.includes(t.id)
    );
    const diagrams = EarthService.getDiagrams(note.projectId).filter((d) =>
      note.linkedDiagramIds?.includes(d.id)
    );
    setAttachedTasks(tasks);
    setAttachedDiagrams(diagrams);
  }, [note.projectId, note.linkedTaskIds, note.linkedDiagramIds]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const clean = newTagInput.trim().replace(/^#/, "");
      if (!note.tags.includes(clean)) {
        onUpdateTags([...note.tags, clean]);
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(note.tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card/70 overflow-hidden shadow-2xs divide-y divide-border/60">
      {/* Header */}
      <div className="p-4 bg-muted/20">
        <h3 className="font-serif text-base font-medium text-foreground tracking-tight">
          Note Context &amp; Linkages
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Knowledge network metadata and associated research deliverables.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Selected text conversion action banner */}
        {selectedText.trim() && (
          <div className="p-3 rounded-xl border border-earth-terracotta/30 bg-earth-terracotta-light/40 dark:bg-earth-terracotta-light/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-earth-terracotta-dark dark:text-earth-terracotta font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Selection Detected</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
              &ldquo;{selectedText}&rdquo;
            </p>
            <Button
              size="sm"
              onClick={onOpenCreateTaskModal}
              className="w-full h-7 text-xs bg-earth-terracotta text-white"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              Convert Selection to Task
            </Button>
          </div>
        )}

        {/* Tags Manager */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-earth-terracotta" />
              <span>Taxonomy Tags</span>
            </Label>
            <span className="text-[10px] text-muted-foreground font-mono">
              Press Enter
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-background">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="muted"
                size="sm"
                className="gap-1 pr-1 text-xs bg-muted/60"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ Add tag..."
              className="text-xs bg-transparent border-none outline-none focus:ring-0 p-1 flex-1 min-w-[80px]"
            />
          </div>
        </div>

        {/* Linked Tasks */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-earth-olive" />
              <Label className="text-xs font-medium">
                Linked Tasks ({attachedTasks.length})
              </Label>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenAttachModal}
              className="h-6 px-1.5 text-[11px] text-earth-terracotta"
            >
              <Plus className="h-3 w-3 mr-0.5" />
              Attach
            </Button>
          </div>

          <div className="space-y-1.5">
            {attachedTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No tasks linked yet.
              </p>
            ) : (
              attachedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border bg-background text-xs gap-2 group"
                >
                  <Link
                    href={`/projects/${note.projectId}/board`}
                    className="min-w-0 flex-1 hover:text-earth-terracotta transition-colors"
                  >
                    <p className="font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                      <span className="capitalize">{task.priority}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{task.status.replace("_", " ")}</span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDetachTask(task.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Detach task (keeps original)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCreateTaskModal}
            className="w-full h-7 text-xs justify-start gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3 text-earth-olive" />
            <span>New Task for Note</span>
          </Button>
        </div>

        {/* Linked Diagrams */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-earth-terracotta" />
              <Label className="text-xs font-medium">
                Linked Diagrams ({attachedDiagrams.length})
              </Label>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenAttachModal}
              className="h-6 px-1.5 text-[11px] text-earth-terracotta"
            >
              <Plus className="h-3 w-3 mr-0.5" />
              Attach
            </Button>
          </div>

          <div className="space-y-1.5">
            {attachedDiagrams.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No diagrams linked yet.
              </p>
            ) : (
              attachedDiagrams.map((diag) => (
                <div
                  key={diag.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border bg-earth-cream/20 dark:bg-card text-xs gap-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{diag.title}</p>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                      {diag.type.replace("_", " ")} &bull; {diag.nodeCount} nodes
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDetachDiagram(diag.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Detach diagram"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCreateDiagramModal}
            className="w-full h-7 text-xs justify-start gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3 text-earth-terracotta" />
            <span>New Diagram for Note</span>
          </Button>
        </div>

        {/* Timestamps Section */}
        <div className="pt-4 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(note.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Edited:</span>
            <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
