"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  Network,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EarthService } from "@/services/earth-service";
import { RelatedItemReference, TaskPriority, TaskType } from "@/services/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CrossModuleLinkDialogProps {
  projectId: string;
  sourceType: "task" | "note" | "diagram";
  sourceId: string;
  sourceTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRelationshipsChanged?: () => void;
}

export function CrossModuleLinkDialog({
  projectId,
  sourceType,
  sourceId,
  sourceTitle,
  open,
  onOpenChange,
  onRelationshipsChanged,
}: CrossModuleLinkDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"current" | "link_existing" | "quick_create">("current");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "task" | "note" | "diagram">("all");

  // Current relationships list
  const [relatedItems, setRelatedItems] = React.useState<RelatedItemReference[]>([]);

  // Search results for existing items
  const [searchResults, setSearchResults] = React.useState<RelatedItemReference[]>([]);

  // Quick Create Form state
  const [createType, setCreateType] = React.useState<"task" | "note" | "diagram">("task");
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState<TaskPriority>("medium");
  const [newTaskType, setNewTaskType] = React.useState<TaskType>("feature");

  const loadRelationships = React.useCallback(() => {
    if (!open) return;
    const items = EarthService.getRelatedItems(projectId, sourceType, sourceId);
    setRelatedItems(items);
  }, [open, projectId, sourceType, sourceId]);

  const loadSearch = React.useCallback(() => {
    if (!open) return;
    const allItems = EarthService.searchProjectItems(projectId, searchQuery, typeFilter);
    // Exclude the source item itself
    const filtered = allItems.filter(
      (item) => !(item.type === sourceType && item.id === sourceId)
    );
    setSearchResults(filtered);
  }, [open, projectId, searchQuery, typeFilter, sourceType, sourceId]);

  React.useEffect(() => {
    if (open) {
      loadRelationships();
      loadSearch();
    }
  }, [open, loadRelationships, loadSearch]);

  const handleLink = (target: RelatedItemReference) => {
    try {
      EarthService.linkItems(sourceType, sourceId, target.type, target.id);
      toast.success("Relationship Established", {
        description: `Linked with "${target.title}".`,
      });
      loadRelationships();
      loadSearch();
      onRelationshipsChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Could not link items.");
    }
  };

  const handleUnlink = (target: RelatedItemReference) => {
    try {
      EarthService.unlinkItems(sourceType, sourceId, target.type, target.id);
      toast.info("Relationship Removed", {
        description: `Unlinked from "${target.title}". Item was not deleted.`,
      });
      loadRelationships();
      loadSearch();
      onRelationshipsChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Could not unlink items.");
    }
  };

  const handleQuickCreateAndLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      let createdId = "";
      if (createType === "task") {
        const columns = EarthService.getColumns(projectId);
        const colId = columns[0]?.id || "col-backlog";
        const task = EarthService.createTask({
          projectId,
          columnId: colId,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          type: newTaskType,
          priority: newTaskPriority,
        });
        createdId = task.id;
      } else if (createType === "note") {
        const note = EarthService.createNote({
          projectId,
          title: newTitle.trim(),
          content: newDesc.trim() || `# ${newTitle.trim()}\n\nTechnical notes created from ${sourceType} "${sourceTitle}".`,
          tags: ["Cross-Module"],
        });
        createdId = note.id;
      } else if (createType === "diagram") {
        const diag = EarthService.createDiagram({
          projectId,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          type: "architecture",
        });
        createdId = diag.id;
      }

      // Automatically link to source
      EarthService.linkItems(sourceType, sourceId, createType, createdId);

      toast.success(`Created & Linked ${createType}`, {
        description: `"${newTitle}" is now connected to ${sourceTitle}.`,
      });

      setNewTitle("");
      setNewDesc("");
      setActiveTab("current");
      loadRelationships();
      loadSearch();
      onRelationshipsChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Could not create and link item.");
    }
  };

  const renderIcon = (type: "task" | "note" | "diagram") => {
    if (type === "task") return <CheckSquare className="h-3.5 w-3.5 text-earth-olive" />;
    if (type === "note") return <FileText className="h-3.5 w-3.5 text-earth-terracotta" />;
    return <Network className="h-3.5 w-3.5 text-earth-charcoal dark:text-earth-cream" />;
  };

  const linkedIds = new Set(relatedItems.map((r) => r.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b bg-muted/15 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-mono">
            <Share2 className="h-3.5 w-3.5 text-earth-terracotta" />
            <span>Cross-Module Relationships</span>
            <span>&bull;</span>
            <span className="capitalize">{sourceType}</span>
          </div>
          <DialogTitle className="text-lg font-serif font-medium truncate">
            {sourceTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage bidirectional relationships between tasks, research notes, and architecture diagrams.
          </DialogDescription>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b bg-card/60 px-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={cn(
              "py-2.5 px-3 border-b-2 font-medium transition-colors",
              activeTab === "current"
                ? "border-earth-terracotta text-earth-terracotta"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Current Links ({relatedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link_existing")}
            className={cn(
              "py-2.5 px-3 border-b-2 font-medium transition-colors",
              activeTab === "link_existing"
                ? "border-earth-terracotta text-earth-terracotta"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Link Existing Item
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quick_create")}
            className={cn(
              "py-2.5 px-3 border-b-2 font-medium transition-colors",
              activeTab === "quick_create"
                ? "border-earth-terracotta text-earth-terracotta"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            + Create &amp; Link
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {/* TAB 1: Current Relationships */}
          {activeTab === "current" && (
            <div className="space-y-3">
              {relatedItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <p className="font-serif text-sm font-medium">No Relationships Connected Yet</p>
                  <p className="text-muted-foreground text-[11px] max-w-sm mx-auto">
                    Connect relevant research notes, implementation tasks, or architecture diagrams to build a cohesive mental model.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("link_existing")}
                      className="text-xs h-8"
                    >
                      Browse Existing Items
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("quick_create")}
                      className="text-xs h-8 bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
                    >
                      + Create New Linked Item
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Removing a relationship unlinks the items in both directions without deleting either item.
                  </p>
                  {relatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:border-earth-terracotta/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                        <div className="p-1.5 rounded-md bg-muted/50 shrink-0">
                          {renderIcon(item.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">{item.title}</span>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider py-0 px-1">
                              {item.type}
                            </Badge>
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-earth-terracotta hover:text-earth-terracotta hover:bg-earth-terracotta/10 px-2"
                        >
                          <Link href={item.href}>
                            <ExternalLink className="h-3 w-3 mr-1" /> Open
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnlink(item)}
                          title="Remove relationship"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Link Existing Item */}
          {activeTab === "link_existing" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <div className="flex rounded-md border p-0.5 bg-muted/30 text-xs">
                  {(["all", "task", "note", "diagram"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs capitalize transition-colors",
                        typeFilter === t
                          ? "bg-background text-foreground font-medium shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === "all" ? "All Types" : t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground italic">
                    No matching items found in this project.
                  </p>
                ) : (
                  searchResults.map((item) => {
                    const isLinked = linkedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border transition-colors",
                          isLinked
                            ? "bg-earth-olive/5 border-earth-olive/30"
                            : "hover:bg-accent/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <div className="p-1 rounded bg-muted/50 shrink-0">
                            {renderIcon(item.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium truncate">{item.title}</span>
                              <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                                {item.type}
                              </Badge>
                            </div>
                            {item.subtitle && (
                              <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        {isLinked ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-earth-olive font-medium flex items-center gap-1">
                              <Check className="h-3 w-3" /> Linked
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] text-muted-foreground hover:text-destructive px-1.5"
                              onClick={() => handleUnlink(item)}
                            >
                              Unlink
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleLink(item)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Connect
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Quick Create & Link */}
          {activeTab === "quick_create" && (
            <form onSubmit={handleQuickCreateAndLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Item Type to Create</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "task", label: "Task", icon: CheckSquare },
                    { id: "note", label: "Research Note", icon: FileText },
                    { id: "diagram", label: "Diagram", icon: Network },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCreateType(opt.id as any)}
                        className={cn(
                          "flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors",
                          createType === opt.id
                            ? "border-earth-terracotta bg-earth-terracotta/10 text-earth-terracotta"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Title</label>
                <Input
                  placeholder={
                    createType === "task"
                      ? "e.g. Calibrate riparian turbidity sensors"
                      : createType === "note"
                      ? "e.g. Mara River Seasonal Discharge RFC"
                      : "e.g. Distributed Ingestion Architecture"
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-8 text-xs"
                  autoFocus
                />
              </div>

              {createType === "task" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Type</label>
                    <Select
                      value={newTaskType}
                      onValueChange={(val: TaskType) => setNewTaskType(val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="chore">Chore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
                    <Select
                      value={newTaskPriority}
                      onValueChange={(val: TaskPriority) => setNewTaskPriority(val)}
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
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">
                  {createType === "note" ? "Content Preview" : "Description (Optional)"}
                </label>
                <Input
                  placeholder="Optional context, specifications, or notes"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setActiveTab("current")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTitle.trim()}
                  className="text-xs h-8 bg-earth-terracotta hover:bg-earth-terracotta/90 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" /> Create &amp; Connect Link
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
          <span>Project isolation: scoped to current project</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
