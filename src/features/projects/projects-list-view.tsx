"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  MoreVertical,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  ArrowRight,
  Compass,
  Mountain,
  Trees,
  CloudRain,
  Sun,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { EarthService } from "@/services/earth-service";
import { Project, ProjectStatus } from "@/services/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  compass: Compass,
  mountain: Mountain,
  trees: Trees,
  "cloud-rain": CloudRain,
  sun: Sun,
};

export function ProjectsListView() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"updated" | "name" | "targetDate">("updated");

  // Deletion dialog state
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

  const projectMetricsMap = React.useMemo(() => {
    const map: Record<string, { completionRate: number; totalTasks: number; openTasks: number }> = {};
    for (const p of projects) {
      try {
        const m = EarthService.getProjectMetrics(p.id);
        map[p.id] = { completionRate: m.completionRate, totalTasks: m.totalTasks, openTasks: m.openTasks };
      } catch {
        map[p.id] = { completionRate: 0, totalTasks: 0, openTasks: 0 };
      }
    }
    return map;
  }, [projects]);

  const loadProjects = React.useCallback(() => {
    const list = EarthService.getProjects({
      search: search || undefined,
      status: statusFilter === "all" ? undefined : (statusFilter as ProjectStatus),
      sort: sortBy,
    });
    setProjects(list);
  }, [search, statusFilter, sortBy]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleArchive = (id: string, name: string) => {
    EarthService.archiveProject(id);
    loadProjects();
    toast.info("Project Archived", {
      description: `"${name}" has been placed in the archive.`,
    });
  };

  const handleRestore = (id: string, name: string) => {
    EarthService.restoreProject(id);
    loadProjects();
    toast.success("Project Restored", {
      description: `"${name}" is active once again.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    EarthService.deleteProject(projectToDelete.id);
    loadProjects();
    toast.error("Project Deleted", {
      description: `Removed "${projectToDelete.name}" and associated records.`,
    });
    setProjectToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              Territory Projects
            </h1>
            <Badge variant="muted" size="sm">
              {projects.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Ecological surveys, environmental preserves, and scientific field campaigns.
          </p>
        </div>

        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      {/* Control Bar: Search, Status Filter, Sort, View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/70 border border-border p-3.5 rounded-xl shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by project title, description, or biome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/80"
          />
        </div>

        {/* Filters and View toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as typeof sortBy)}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="name">Project Name (A-Z)</SelectItem>
              <SelectItem value="targetDate">Target Date</SelectItem>
            </SelectContent>
          </Select>

          {/* Grid / List Switcher */}
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-earth-cream text-earth-charcoal dark:bg-muted dark:text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Compact list view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Render: Empty vs Grid vs List */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Projects Found"
          description={
            search || statusFilter !== "all"
              ? "No territory projects match your active search or filter criteria."
              : "No projects exist yet. Initiate your first research expedition."
          }
          action={
            search || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear Search &amp; Filters
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Initiate First Project
                </Link>
              </Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const IconComponent = ICON_MAP[project.icon] || Compass;
            const isArchived = project.status === "archived";

            return (
              <Card
                key={project.id}
                className={cn(
                  "group flex flex-col justify-between p-6 transition-all hover:border-earth-terracotta/40 hover:shadow-xs",
                  isArchived && "opacity-70 bg-muted/30"
                )}
              >
                <div className="space-y-3">
                  {/* Card Header: Icon, Biome, Status, Menu */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-cream text-earth-terracotta dark:bg-muted shadow-2xs">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block">
                          {project.biome}
                        </span>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "terracotta"
                              : project.status === "completed"
                              ? "olive"
                              : "muted"
                          }
                          size="sm"
                          className="capitalize mt-0.5"
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="Project actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            <span>Overview</span>
                          </Link>
                        </DropdownMenuItem>

                        {isArchived ? (
                          <DropdownMenuItem
                            onClick={() => handleRestore(project.id, project.name)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4 text-earth-olive" />
                            <span>Restore Project</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleArchive(project.id, project.name)}
                          >
                            <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Archive Project</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setProjectToDelete(project)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-serif text-xl font-normal text-foreground group-hover:text-earth-terracotta transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {projectMetricsMap[project.id] && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{projectMetricsMap[project.id].openTasks} open &bull; {projectMetricsMap[project.id].totalTasks} tasks</span>
                        <span className="font-medium text-foreground">{projectMetricsMap[project.id].completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-earth-terracotta h-full rounded-full transition-all duration-300"
                          style={{ width: `${projectMetricsMap[project.id].completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{project.targetDate ? `Due ${project.targetDate}` : "Ongoing"}</span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-earth-terracotta group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                  >
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Compact List View */
        <Card className="divide-y divide-border/60 overflow-hidden">
          {projects.map((project) => {
            const IconComponent = ICON_MAP[project.icon] || Compass;
            const isArchived = project.status === "archived";

            return (
              <div
                key={project.id}
                className={cn(
                  "flex items-center justify-between p-4 hover:bg-muted/40 transition-colors gap-4",
                  isArchived && "opacity-60 bg-muted/20"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-earth-cream text-earth-terracotta dark:bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-serif text-base font-normal text-foreground hover:text-earth-terracotta transition-colors truncate"
                      >
                        {project.name}
                      </Link>
                      <Badge
                        variant={
                          project.status === "active"
                            ? "terracotta"
                            : project.status === "completed"
                            ? "olive"
                            : "muted"
                        }
                        size="sm"
                        className="capitalize"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.biome} &bull; {project.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {projectMetricsMap[project.id] && (
                    <div className="hidden lg:flex flex-col items-end gap-1 w-28">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                        <span>{projectMetricsMap[project.id].completionRate}%</span>
                        <span className="text-[10px] text-muted-foreground/60">&bull; {projectMetricsMap[project.id].openTasks} open</span>
                      </div>
                      <div className="w-full bg-muted/80 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-earth-terracotta h-full rounded-full"
                          style={{ width: `${projectMetricsMap[project.id].completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-muted-foreground block font-mono">
                      {project.targetDate ? `Due ${project.targetDate}` : "Ongoing"}
                    </span>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects/${project.id}`}>
                      <span>Overview</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Project Removal</span>
            </DialogTitle>
            <DialogDescription>
              Are you certain you want to permanently delete &ldquo;{projectToDelete?.name}&rdquo;?
              This will remove all associated field tasks, notes, and records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
