"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/features/projects/projects-context";
import { EarthService } from "@/services/earth-service";
import { Task, Note, Diagram } from "@/services/types";
import {
  Search,
  LayoutDashboard,
  User,
  Settings,
  Sparkles,
  FolderKanban,
  Plus,
  CheckSquare,
  FileText,
  Network,
  ArrowRight,
} from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateProject?: () => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  onOpenCreateProject,
}: SearchDialogProps) {
  const router = useRouter();
  const { projects, setActiveProjectId } = useProjects();
  const [query, setQuery] = React.useState("");

  const [matchingTasks, setMatchingTasks] = React.useState<Task[]>([]);
  const [matchingNotes, setMatchingNotes] = React.useState<Note[]>([]);
  const [matchingDiagrams, setMatchingDiagrams] = React.useState<Diagram[]>([]);

  React.useEffect(() => {
    if (!open) return;
    const q = query.toLowerCase().trim();
    if (!q) {
      setMatchingTasks([]);
      setMatchingNotes([]);
      setMatchingDiagrams([]);
      return;
    }

    const allTasks = EarthService.getTasks();
    const allNotes = EarthService.getNotes();
    const allDiagrams = EarthService.getDiagrams();

    setMatchingTasks(
      allTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.labels.some((l) => l.toLowerCase().includes(q))
      ).slice(0, 5)
    );

    setMatchingNotes(
      allNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 5)
    );

    setMatchingDiagrams(
      allDiagrams.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }, [open, query]);

  const navigateTo = (path: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(path);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.biome.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Earth observatory</DialogTitle>
        </DialogHeader>

        <div className="flex items-center border-b border-border px-4 py-3 gap-2.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search projects, tasks, notes, diagrams, routes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent p-0 h-9 focus-visible:ring-0 focus-visible:border-transparent text-sm"
            autoFocus
          />
          <Kbd>ESC</Kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2 space-y-4 text-sm">
          {/* Item Type: Tasks Search Results */}
          {matchingTasks.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Matching Tasks ({matchingTasks.length})
              </span>
              <div className="space-y-0.5">
                {matchingTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => navigateTo(`/projects/${task.projectId}/board`)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <CheckSquare className="h-4 w-4 text-earth-olive shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-foreground truncate block group-hover:text-earth-terracotta">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          Priority: {task.priority} &bull; Status: {task.status}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                      Task
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Type: Notes Search Results */}
          {matchingNotes.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Matching Knowledge Notes ({matchingNotes.length})
              </span>
              <div className="space-y-0.5">
                {matchingNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => navigateTo(`/projects/${note.projectId}/notes`)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <FileText className="h-4 w-4 text-earth-terracotta shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-foreground truncate block group-hover:text-earth-terracotta">
                          {note.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          {note.content.slice(0, 60)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                      Note
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Type: Diagrams Search Results */}
          {matchingDiagrams.length > 0 && (
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Matching Architecture Diagrams ({matchingDiagrams.length})
              </span>
              <div className="space-y-0.5">
                {matchingDiagrams.map((diag) => (
                  <button
                    key={diag.id}
                    type="button"
                    onClick={() => navigateTo(`/projects/${diag.projectId}/sketch`)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Network className="h-4 w-4 text-earth-olive shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-foreground truncate block group-hover:text-earth-olive">
                          {diag.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          {diag.nodeCount} topology nodes &bull; {diag.type}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                      Diagram
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Group */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Territory Projects
              </span>
              {onOpenCreateProject && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenCreateProject();
                  }}
                  className="text-[11px] text-earth-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  New Project
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {filteredProjects.length === 0 ? (
                <div className="px-3 py-2 text-center text-xs text-muted-foreground">
                  No matching projects found.
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      navigateTo(`/projects/${project.id}`);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="h-4 w-4 text-earth-olive" />
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{project.name}</span>
                        <span className="text-[11px] text-muted-foreground">{project.biome}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                      Project
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Navigation group */}
          <div className="space-y-1 border-t pt-2">
            <span className="px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              System Views
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => navigateTo("/dashboard")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-muted/70 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-3.5 w-3.5 text-earth-terracotta" />
                  <span>Dashboard Overview</span>
                </div>
                <span className="text-[11px] text-muted-foreground">/dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/settings/profile")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-muted/70 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <User className="h-3.5 w-3.5 text-earth-olive" />
                  <span>Researcher Profile</span>
                </div>
                <span className="text-[11px] text-muted-foreground">/settings/profile</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/settings/preferences")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-muted/70 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Observatory Preferences</span>
                </div>
                <span className="text-[11px] text-muted-foreground">/settings/preferences</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("/design-system")}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-muted/70 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-earth-terracotta" />
                  <span>Design System Primitives</span>
                </div>
                <span className="text-[11px] text-muted-foreground">/design-system</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
