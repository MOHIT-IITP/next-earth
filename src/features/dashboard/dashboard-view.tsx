"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Network,
  Activity,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  Compass,
  CheckSquare,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/auth-context";
import { EarthService } from "@/services/earth-service";
import {
  Project,
  Task,
  Note,
  Diagram,
  ActivityItem,
  DashboardMetrics,
} from "@/services/types";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const router = useRouter();
  const { user } = useAuth();

  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    archivedProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  const [recentProjects, setRecentProjects] = React.useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = React.useState<Task[]>([]);
  const [recentNotes, setRecentNotes] = React.useState<Note[]>([]);
  const [recentDiagrams, setRecentDiagrams] = React.useState<Diagram[]>([]);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "overdue">("all");

  const refreshData = React.useCallback(() => {
    const m = EarthService.getDashboardMetrics();
    setMetrics(m);
    setRecentProjects(EarthService.getProjects().slice(0, 4));
    setRecentTasks(EarthService.getTasks().slice(0, 5));
    setRecentNotes(EarthService.getNotes().slice(0, 3));
    setRecentDiagrams(EarthService.getDiagrams().slice(0, 3));
    setActivities(EarthService.getActivities(6));
  }, []);

  React.useEffect(() => {
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener("earth-data-updated", handleUpdate);
    return () => window.removeEventListener("earth-data-updated", handleUpdate);
  }, [refreshData]);

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    EarthService.updateTaskStatus(task.id, newStatus);
    refreshData();
    toast.success(
      newStatus === "completed" ? "Task Marked Complete" : "Task Reopened",
      {
        description: `"${task.title}" updated. Overall completion is now ${EarthService.getDashboardMetrics().completionRate}%.`,
      }
    );
  };

  const handleResetSampleData = () => {
    EarthService.resetToMockData();
    refreshData();
    toast.success("Sample Data Restored", {
      description: "Restored realistic biosphere projects and ecological tasks.",
    });
  };

  const handleClearAllData = () => {
    EarthService.clearAllData();
    refreshData();
    toast.info("Observatory Archive Cleared", {
      description: "Switched to clean empty state for demonstration.",
    });
  };

  // Filtered projects
  const filteredProjects = recentProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.biome.toLowerCase().includes(filterQuery.toLowerCase());
    if (statusFilter === "active") return matchesSearch && p.status === "active";
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              Welcome back, {user?.name || "Dr. Elena Rostova"}
            </h1>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-earth-terracotta" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Observatory status across active biomes, field protocols, and ecological data streams.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={metrics.totalProjects === 0 ? handleResetSampleData : handleClearAllData}
            title={metrics.totalProjects === 0 ? "Restore sample projects" : "Simulate new user empty state"}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>{metrics.totalProjects === 0 ? "Load Sample Data" : "Test Empty State"}</span>
          </Button>

          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty State for completely new user */}
      {metrics.totalProjects === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your Observatory has No Active Projects"
          description="Begin by establishing an ecological field survey, territory project, or biome inventory to activate analytics."
          action={
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Project
                </Link>
              </Button>
              <Button variant="outline" onClick={handleResetSampleData}>
                Load Sample Observatory Data
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {/* Key Metrics Grid (All mathematically derived from live data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total & Active Projects */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono uppercase tracking-wider">Territory Projects</span>
                <FolderKanban className="h-4 w-4 text-earth-terracotta" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-medium text-foreground">
                  {metrics.totalProjects}
                </span>
                <Badge variant="terracotta" size="sm">
                  {metrics.activeProjects} Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.completedProjects} archived / completed
              </p>
            </Card>

            {/* Open & Overdue Tasks */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono uppercase tracking-wider">Open Tasks</span>
                <Clock className="h-4 w-4 text-earth-olive" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-medium text-foreground">
                  {metrics.openTasks}
                </span>
                {metrics.overdueTasks > 0 ? (
                  <Badge variant="destructive" size="sm" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{metrics.overdueTasks} Overdue</span>
                  </Badge>
                ) : (
                  <Badge variant="olive" size="sm">
                    On Schedule
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.completedTasks} tasks already completed
              </p>
            </Card>

            {/* Overall Completion Rate */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono uppercase tracking-wider">Overall Progress</span>
                <TrendingUp className="h-4 w-4 text-earth-terracotta" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-medium text-foreground">
                  {metrics.completionRate}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {metrics.completedTasks} of {metrics.totalTasks} tasks
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-earth-terracotta h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${metrics.completionRate}%` }}
                />
              </div>
            </Card>

            {/* Field Notes & Diagrams summary */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono uppercase tracking-wider">Research Assets</span>
                <Layers className="h-4 w-4 text-earth-charcoal dark:text-earth-ivory" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl font-medium text-foreground">
                  {recentNotes.length + recentDiagrams.length}
                </span>
                <div className="flex gap-1.5">
                  <Badge variant="muted" size="sm">{recentNotes.length} Notes</Badge>
                  <Badge variant="muted" size="sm">{recentDiagrams.length} Diags</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Structured field documentation
              </p>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 border border-border p-3 rounded-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Filter recent projects by title or biome..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9 bg-background/80 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors",
                    statusFilter === "all"
                      ? "bg-earth-cream text-earth-charcoal font-medium dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({metrics.totalProjects})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors",
                    statusFilter === "active"
                      ? "bg-earth-cream text-earth-charcoal font-medium dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Active ({metrics.activeProjects})
                </button>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/projects">
                  <span>View All Projects</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Grid: Projects & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Recent Projects & Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-earth-terracotta" />
                    <h2 className="font-serif text-xl font-normal text-foreground">
                      Recent Projects
                    </h2>
                  </div>
                  <Link
                    href="/projects"
                    className="text-xs text-earth-terracotta hover:underline inline-flex items-center gap-1"
                  >
                    All projects ({metrics.totalProjects})
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="group flex flex-col justify-between p-5 hover:border-earth-terracotta/40 transition-all hover:shadow-xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-mono font-medium",
                              project.status === "active"
                                ? "bg-earth-terracotta-light text-earth-terracotta-dark dark:bg-earth-terracotta-light/20 dark:text-earth-terracotta"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {project.biome}
                          </span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              project.status === "active" ? "bg-earth-olive" : "bg-muted-foreground"
                            )}
                          />
                        </div>

                        <Link
                          href={`/projects/${project.id}`}
                          className="font-serif text-lg font-normal text-foreground group-hover:text-earth-terracotta transition-colors line-clamp-1"
                        >
                          {project.name}
                        </Link>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {project.targetDate || "No target date"}
                        </span>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-earth-terracotta font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                        >
                          Overview
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recently Updated Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-earth-olive" />
                    <h2 className="font-serif text-xl font-normal text-foreground">
                      Recently Updated Tasks
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Click checkbox to complete
                  </span>
                </div>

                <Card className="divide-y divide-border/60">
                  {recentTasks.map((task) => {
                    const isCompleted = task.status === "completed";
                    const isOverdue =
                      !isCompleted &&
                      task.dueDate &&
                      new Date(task.dueDate) < new Date("2026-10-24");

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start justify-between p-4 gap-3 transition-colors hover:bg-muted/30",
                          isCompleted && "opacity-60 bg-muted/20"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task)}
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isCompleted
                                ? "bg-earth-olive border-earth-olive text-white"
                                : "border-input hover:border-earth-terracotta"
                            )}
                            aria-label={`Mark "${task.title}" as ${isCompleted ? "open" : "completed"}`}
                          >
                            {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium text-foreground truncate",
                                isCompleted && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              {task.dueDate && (
                                <span
                                  className={cn(
                                    "flex items-center gap-1",
                                    isOverdue && "text-destructive font-medium"
                                  )}
                                >
                                  <Clock className="h-3 w-3" />
                                  {isOverdue ? `Overdue (${task.dueDate})` : `Due ${task.dueDate}`}
                                </span>
                              )}
                              <span>&bull;</span>
                              <span className="capitalize">{task.priority} priority</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Badge
                            variant={
                              isCompleted
                                ? "olive"
                                : isOverdue
                                ? "destructive"
                                : task.status === "in_progress"
                                ? "terracotta"
                                : "outline"
                            }
                            size="sm"
                          >
                            {isCompleted
                              ? "Done"
                              : isOverdue
                              ? "Overdue"
                              : task.status === "in_progress"
                              ? "In Progress"
                              : "To Do"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            </div>

            {/* Right Column: Notes, Diagrams & Activity Feed */}
            <div className="space-y-8">
              {/* Recent Notes & Diagrams */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-earth-charcoal dark:text-earth-ivory" />
                    <h2 className="font-serif text-xl font-normal text-foreground">
                      Notes &amp; Diagrams
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <Card key={note.id} className="p-4 space-y-2 hover:border-border transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {note.title}
                        </p>
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="muted" size="sm" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}

                  {recentDiagrams.map((diag) => (
                    <Link key={diag.id} href={`/projects/${diag.projectId}/sketch`} className="block group">
                      <Card className="p-4 space-y-1.5 hover:border-earth-terracotta/50 transition-colors bg-earth-cream/30 dark:bg-card">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            {diag.type.replace("_", " ")}
                          </span>
                          <Network className="h-3.5 w-3.5 text-earth-terracotta shrink-0 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-earth-terracotta">
                          {diag.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {diag.nodeCount} topology nodes mapped
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-earth-terracotta" />
                  <h2 className="font-serif text-xl font-normal text-foreground">
                    Recent Activity
                  </h2>
                </div>

                <Card className="p-4">
                  <div className="space-y-4">
                    {activities.map((act, index) => (
                      <div key={act.id} className="flex items-start gap-3 text-xs">
                        <span className="mt-1 h-2 w-2 rounded-full bg-earth-terracotta shrink-0" />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-foreground">
                            <span className="font-medium">{act.user}</span>{" "}
                            <span className="text-muted-foreground">{act.action}</span>{" "}
                            <span className="font-medium text-foreground truncate">&ldquo;{act.target}&rdquo;</span>
                          </p>
                          <span className="text-[11px] text-muted-foreground block">
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
