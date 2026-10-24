"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Mountain,
  Trees,
  CloudRain,
  Sun,
  Columns,
  FileText,
  Network,
  LayoutDashboard,
  Search,
  Plus,
  ChevronDown,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  FolderKanban,
  CheckSquare,
  Share2,
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
import { EarthService } from "@/services/earth-service";
import { Project, ProjectMetrics } from "@/services/types";
import { ProjectSearchDialog } from "./project-search-dialog";
import { ProjectActivityDialog } from "./project-activity-dialog";
import { CrossModuleLinkDialog } from "@/features/relations/cross-module-link-dialog";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  compass: Compass,
  mountain: Mountain,
  trees: Trees,
  cloudRain: CloudRain,
  sun: Sun,
};

interface ProjectWorkspaceHeaderProps {
  projectId: string;
}

export function ProjectWorkspaceHeader({ projectId }: ProjectWorkspaceHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [project, setProject] = React.useState<Project | undefined>(undefined);
  const [allProjects, setAllProjects] = React.useState<Project[]>([]);
  const [metrics, setMetrics] = React.useState<ProjectMetrics | null>(null);

  // Dialog states
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isActivityOpen, setIsActivityOpen] = React.useState(false);

  const loadData = React.useCallback(() => {
    const p = EarthService.getProjectById(projectId);
    setProject(p);
    setAllProjects(EarthService.getProjects());
    setMetrics(EarthService.getProjectMetrics(projectId));
  }, [projectId]);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("earth-data-updated", handleUpdate);
    return () => window.removeEventListener("earth-data-updated", handleUpdate);
  }, [loadData]);

  if (!project) return null;

  const IconComponent = ICON_MAP[project.icon] || Compass;

  // Determine current active subtab
  const isOverview = pathname === `/projects/${projectId}`;
  const isBoard = pathname === `/projects/${projectId}/board`;
  const isNotes = pathname === `/projects/${projectId}/notes`;
  const isSketch = pathname === `/projects/${projectId}/sketch`;

  // Get current sub-path suffix (e.g. "/board", "/notes", "/sketch", or "")
  const getSubPath = () => {
    if (isBoard) return "/board";
    if (isNotes) return "/notes";
    if (isSketch) return "/sketch";
    return "";
  };

  const handleSwitchProject = (targetId: string) => {
    const sub = getSubPath();
    router.push(`/projects/${targetId}${sub}`);
  };

  return (
    <div className="space-y-4 mb-6 select-none">
      {/* Top Strip: Project Switcher & Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-3">
          {/* Project Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 p-1.5 -ml-1.5 rounded-lg hover:bg-muted/60 transition-colors text-left group"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-colors",
                    project.accent === "terracotta" && "bg-earth-terracotta/10 text-earth-terracotta border-earth-terracotta/20",
                    project.accent === "olive" && "bg-earth-olive/10 text-earth-olive border-earth-olive/20",
                    project.accent === "sand" && "bg-earth-sand/30 text-amber-800 dark:text-amber-300 border-earth-sand/40",
                    project.accent === "charcoal" && "bg-earth-charcoal/10 text-earth-charcoal dark:text-neutral-300 border-earth-charcoal/20"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-lg font-medium tracking-tight text-foreground group-hover:text-earth-terracotta transition-colors truncate max-w-[220px] sm:max-w-[340px]">
                      {project.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="uppercase font-mono text-[10px] tracking-wider">{project.biome}</span>
                    <span>&bull;</span>
                    <span className="capitalize">{project.status.replace("_", " ")}</span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Territory Projects Switcher
              </DropdownMenuLabel>
              {allProjects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleSwitchProject(p.id)}
                  className={cn(
                    "flex items-center justify-between text-xs cursor-pointer py-2",
                    p.id === projectId && "bg-accent font-medium text-earth-terracotta"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        p.accent === "terracotta" && "bg-earth-terracotta",
                        p.accent === "olive" && "bg-earth-olive",
                        p.accent === "sand" && "bg-earth-sand dark:bg-yellow-600",
                        p.accent === "charcoal" && "bg-earth-charcoal"
                      )}
                    />
                    <span className="truncate">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">
                    {p.biome.slice(0, 8)}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <Link href="/projects">
                  <FolderKanban className="h-3.5 w-3.5 mr-2" /> View All Projects
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-xs cursor-pointer">
                <Link href="/projects/new">
                  <Plus className="h-3.5 w-3.5 mr-2 text-earth-terracotta" /> Create New Territory Project
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Project-wide Search */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Search this project"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search Project</span>
          </Button>

          {/* Activity Drawer Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsActivityOpen(true)}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Project activity timeline"
          >
            <Activity className="h-3.5 w-3.5 text-earth-olive" />
            <span className="hidden sm:inline">Activity</span>
          </Button>

          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 text-xs bg-earth-terracotta hover:bg-earth-terracotta/90 text-white gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem
                onClick={() => {
                  const cols = EarthService.getColumns(projectId);
                  EarthService.createTask({
                    projectId,
                    columnId: cols[0]?.id || "col-backlog",
                    title: "New Implementation Task",
                    type: "feature",
                    priority: "medium",
                  });
                  window.dispatchEvent(new Event("earth-data-updated"));
                  router.push(`/projects/${projectId}/board`);
                }}
                className="cursor-pointer"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-2 text-earth-olive" /> New Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  EarthService.createNote({
                    projectId,
                    title: "Untitled Research Note",
                    content: "# Untitled Note\n\nRecord observations and hypotheses.",
                    tags: ["Research"],
                  });
                  window.dispatchEvent(new Event("earth-data-updated"));
                  router.push(`/projects/${projectId}/notes`);
                }}
                className="cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 mr-2 text-earth-terracotta" /> New Note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  EarthService.createDiagram({
                    projectId,
                    title: "Untitled Architecture Canvas",
                    type: "architecture",
                  });
                  window.dispatchEvent(new Event("earth-data-updated"));
                  router.push(`/projects/${projectId}/sketch`);
                }}
                className="cursor-pointer"
              >
                <Network className="h-3.5 w-3.5 mr-2 text-earth-charcoal dark:text-earth-cream" /> New Diagram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Sub-Tabs Strip */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs shadow-2xs">
          <Link
            href={`/projects/${projectId}`}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors",
              isOverview
                ? "bg-earth-terracotta text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </Link>

          <Link
            href={`/projects/${projectId}/board`}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors",
              isBoard
                ? "bg-earth-terracotta text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Board</span>
            {metrics && (
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                  isBoard ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {metrics.openTasks}
              </span>
            )}
          </Link>

          <Link
            href={`/projects/${projectId}/notes`}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors",
              isNotes
                ? "bg-earth-terracotta text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Notes</span>
            {metrics && (
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                  isNotes ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {metrics.totalNotes}
              </span>
            )}
          </Link>

          <Link
            href={`/projects/${projectId}/sketch`}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors",
              isSketch
                ? "bg-earth-terracotta text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Sketch</span>
            {metrics && (
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.2 rounded-full",
                  isSketch ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {metrics.totalDiagrams}
              </span>
            )}
          </Link>
        </div>

        {/* Project Target Date indicator */}
        {project.targetDate && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-earth-olive" />
            <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Project-wide Search Modal */}
      <ProjectSearchDialog
        projectId={projectId}
        projectName={project.name}
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />

      {/* Project Activity Timeline Modal */}
      <ProjectActivityDialog
        projectId={projectId}
        projectName={project.name}
        open={isActivityOpen}
        onOpenChange={setIsActivityOpen}
      />
    </div>
  );
}
