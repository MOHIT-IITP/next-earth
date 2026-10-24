"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Plus,
  Columns,
  FolderKanban,
  ChevronDown,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/components/ui/toast";
import { NotesSidebar } from "./notes-sidebar";
import { RichEditor } from "./rich-editor";
import { RelatedItemsPanel } from "./related-items-panel";
import { RelatedItemsPickerDialog } from "./related-items-picker-dialog";
import { CreateTaskFromNoteDialog } from "./create-task-from-note-dialog";
import { CrossModuleLinkDialog } from "@/features/relations/cross-module-link-dialog";
import { EarthService } from "@/services/earth-service";
import { Project, Note, Diagram } from "@/services/types";
import { cn } from "@/lib/utils";

export function NotesModuleView({ projectId }: { projectId: string }) {
  const [project, setProject] = React.useState<Project | null>(null);
  const [allProjects, setAllProjects] = React.useState<Project[]>([]);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"updated" | "created" | "title">("updated");

  // Selection state from editor
  const [selectedText, setSelectedText] = React.useState("");

  // Autosave status
  const [saveStatus, setSaveStatus] = React.useState<"saving" | "saved" | "unsaved" | "error">("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  // Dialog states
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [renameTargetId, setRenameTargetId] = React.useState("");
  const [renameInput, setRenameInput] = React.useState("");

  const [isAttachModalOpen, setIsAttachModalOpen] = React.useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);
  const [isCreateDiagramModalOpen, setIsCreateDiagramModalOpen] = React.useState(false);

  // Direct Diagram state
  const [newDiagramTitle, setNewDiagramTitle] = React.useState("");
  const [newDiagramType, setNewDiagramType] = React.useState<Diagram["type"]>("ecosystem");

  // Mobile layout tab switcher: "sidebar" | "editor" | "inspector"
  const [mobileTab, setMobileTab] = React.useState<"sidebar" | "editor" | "inspector">("editor");

  const loadData = React.useCallback(() => {
    const p = EarthService.getProjectById(projectId);
    setProject(p || null);
    setAllProjects(EarthService.getProjects());

    if (p) {
      const list = EarthService.getNotes(projectId, {
        search: searchQuery || undefined,
        tag: selectedTag === "all" ? undefined : selectedTag,
        sort: sortBy,
      });
      setNotes(list);

      // Select first note if none selected or invalid
      if (list.length > 0 && (!activeNoteId || !list.some((n) => n.id === activeNoteId))) {
        setActiveNoteId(list[0].id);
      }
    }
  }, [projectId, searchQuery, selectedTag, sortBy, activeNoteId]);

  React.useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("earth-data-updated", handleUpdate);
    return () => window.removeEventListener("earth-data-updated", handleUpdate);
  }, [loadData]);

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

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;

  // Collect all unique tags for filter
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Save content handler
  const handleSaveContent = (newContent: string) => {
    if (!activeNote) return;
    setSaveStatus("saving");

    try {
      EarthService.updateNote(activeNote.id, { content: newContent });
      setSaveStatus("saved");
      setLastSavedAt(new Date());

      // Silently refresh notes in background without resetting focus
      const updatedNotes = EarthService.getNotes(projectId, {
        search: searchQuery || undefined,
        tag: selectedTag === "all" ? undefined : selectedTag,
        sort: sortBy,
      });
      setNotes(updatedNotes);
    } catch {
      setSaveStatus("error");
      toast.error("Failed to save changes.");
    }
  };

  // Create Note
  const handleNewNote = () => {
    const created = EarthService.createNote({
      projectId: project.id,
      title: "Untitled Field Observation",
      content: "# Untitled Field Observation\n\nBegin drafting observations here...\n",
      tags: ["Draft", project.biome],
    });

    loadData();
    setActiveNoteId(created.id);
    setMobileTab("editor");
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("New Note Created", { description: "Initialized empty observation." });
  };

  // Duplicate Note
  const handleDuplicateNote = (id: string) => {
    const dup = EarthService.duplicateNote(id);
    loadData();
    setActiveNoteId(dup.id);
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Note Duplicated", { description: `Created copy "${dup.title}".` });
  };

  // Delete Note
  const handleDeleteNote = (id: string) => {
    EarthService.deleteNote(id);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.error("Note Deleted", { description: "Note removed from knowledge base." });
  };

  // Rename Note
  const handleOpenRename = (id: string, currentTitle: string) => {
    setRenameTargetId(id);
    setRenameInput(currentTitle);
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameInput.trim()) return;

    EarthService.updateNote(renameTargetId, { title: renameInput.trim() });
    setIsRenameDialogOpen(false);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Note Renamed", { description: `Updated title to "${renameInput.trim()}".` });
  };

  // Tag update handler
  const handleUpdateTags = (newTags: string[]) => {
    if (!activeNote) return;
    EarthService.updateNote(activeNote.id, { tags: newTags });
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
  };

  // Cross-module linking
  const handleAttachTask = (taskId: string) => {
    if (!activeNote) return;
    EarthService.attachTaskToNote(activeNote.id, taskId);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Task Linked", { description: "Task associated with note." });
  };

  const handleDetachTask = (taskId: string) => {
    if (!activeNote) return;
    EarthService.detachTaskFromNote(activeNote.id, taskId);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
  };

  const handleAttachDiagram = (diagramId: string) => {
    if (!activeNote) return;
    EarthService.attachDiagramToNote(activeNote.id, diagramId);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Diagram Linked", { description: "Diagram associated with note." });
  };

  const handleDetachDiagram = (diagramId: string) => {
    if (!activeNote) return;
    EarthService.detachDiagramFromNote(activeNote.id, diagramId);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
  };

  const handleCreateDiagramDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagramTitle.trim() || !activeNote) return;

    const diag = EarthService.createDiagram({
      projectId: project.id,
      title: newDiagramTitle.trim(),
      type: newDiagramType,
    });

    EarthService.attachDiagramToNote(activeNote.id, diag.id);
    setIsCreateDiagramModalOpen(false);
    setNewDiagramTitle("");
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Diagram Created & Attached", { description: `Linked "${diag.title}".` });
  };

  return (
    <div className="space-y-4">
      {/* Persistence Notice Banner (Clearly distinguishing simulated frontend persistence from server database storage) */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-earth-olive shrink-0" />
          <span>
            <strong className="text-foreground">Frontend Phase 5:</strong> Notes and cross-module attachments are autosaved to local state and persist across refreshes.
          </span>
        </div>
        <Badge variant="muted" size="sm" className="font-mono text-[10px]">
          Local Storage Mock
        </Badge>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden rounded-lg border border-border bg-card p-0.5 text-xs">
        <button
          type="button"
          onClick={() => setMobileTab("sidebar")}
          className={cn(
            "flex-1 py-1.5 rounded-md transition-colors text-center font-medium",
            mobileTab === "sidebar"
              ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
              : "text-muted-foreground"
          )}
        >
          Notes Index ({notes.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={cn(
            "flex-1 py-1.5 rounded-md transition-colors text-center font-medium",
            mobileTab === "editor"
              ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
              : "text-muted-foreground"
          )}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("inspector")}
          className={cn(
            "flex-1 py-1.5 rounded-md transition-colors text-center font-medium",
            mobileTab === "inspector"
              ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
              : "text-muted-foreground"
          )}
        >
          Linkages
        </button>
      </div>

      {/* Main 3-Column Layout: Sidebar + Central Rich Editor + Contextual Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left Column: Notes Sidebar (3 cols on desktop) */}
        <div
          className={cn(
            "md:col-span-4 lg:col-span-3 h-[640px]",
            mobileTab !== "sidebar" && "hidden md:block"
          )}
        >
          <NotesSidebar
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setMobileTab("editor");
            }}
            onNewNote={handleNewNote}
            onDuplicateNote={handleDuplicateNote}
            onDeleteNote={handleDeleteNote}
            onRenameNote={handleOpenRename}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            sortBy={sortBy}
            onSortChange={setSortBy}
            allTags={allTags}
          />
        </div>

        {/* Center Column: Central Rich Editor (6 cols on desktop) */}
        <div
          className={cn(
            "md:col-span-8 lg:col-span-6 h-[640px]",
            mobileTab !== "editor" && "hidden md:block"
          )}
        >
          {activeNote ? (
            <RichEditor
              key={activeNote.id}
              initialContent={activeNote.content}
              onSave={handleSaveContent}
              onSelectionChange={setSelectedText}
              saveStatus={saveStatus}
              lastSavedAt={lastSavedAt}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-serif text-lg font-medium">No Note Selected</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Select an observation from the index or initialize a new research document.
              </p>
              <Button size="sm" onClick={handleNewNote}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create First Note
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Related Items Inspector (3 cols on desktop) */}
        <div
          className={cn(
            "md:col-span-12 lg:col-span-3 h-[640px]",
            mobileTab !== "inspector" && "hidden lg:block"
          )}
        >
          {activeNote ? (
            <RelatedItemsPanel
              key={`panel-${activeNote.id}`}
              note={activeNote}
              selectedText={selectedText}
              onUpdateTags={handleUpdateTags}
              onOpenAttachModal={() => setIsAttachModalOpen(true)}
              onOpenCreateTaskModal={() => setIsCreateTaskModalOpen(true)}
              onOpenCreateDiagramModal={() => setIsCreateDiagramModalOpen(true)}
              onDetachTask={handleDetachTask}
              onDetachDiagram={handleDetachDiagram}
            />
          ) : (
            <div className="flex items-center justify-center h-full rounded-2xl border border-border bg-card/30 p-6 text-center text-xs text-muted-foreground">
              Select a note to inspect linkages and tags.
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleConfirmRename}>
            <DialogHeader>
              <DialogTitle>Rename Research Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="rename-note-title" required>Note Title</Label>
                <Input
                  id="rename-note-title"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Title</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reusable Cross-Module Linking Dialog */}
      {activeNote && isAttachModalOpen && (
        <CrossModuleLinkDialog
          projectId={project.id}
          sourceType="note"
          sourceId={activeNote.id}
          sourceTitle={activeNote.title}
          open={isAttachModalOpen}
          onOpenChange={setIsAttachModalOpen}
          onRelationshipsChanged={loadData}
        />
      )}

      {/* Create Task from Note Dialog */}
      {activeNote && (
        <CreateTaskFromNoteDialog
          projectId={project.id}
          noteId={activeNote.id}
          noteTitle={activeNote.title}
          selectedText={selectedText}
          open={isCreateTaskModalOpen}
          onOpenChange={setIsCreateTaskModalOpen}
          onTaskCreated={(taskId) => {
            loadData();
            window.dispatchEvent(new Event("earth-data-updated"));
          }}
        />
      )}

      {/* Create Diagram Directly from Note Dialog */}
      <Dialog open={isCreateDiagramModalOpen} onOpenChange={setIsCreateDiagramModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleCreateDiagramDirectly}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-earth-terracotta" />
                <span>Create &amp; Link Diagram</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="direct-diag-title" required>Diagram Title</Label>
                <Input
                  id="direct-diag-title"
                  placeholder={`e.g. Model for ${activeNote?.title || "Field Survey"}`}
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
    </div>
  );
}
