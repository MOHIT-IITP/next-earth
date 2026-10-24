"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Mountain,
  Trees,
  CloudRain,
  Sun,
  Calendar,
  Edit,
  Archive,
  RotateCcw,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Network,
  Columns,
  Layers,
  AlertCircle,
  Share2,
  Activity,
  CheckSquare,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { toast } from "@/components/ui/toast";
import { EarthService } from "@/services/earth-service";
import {
  Project,
  Task,
  Note,
  Diagram,
  ProjectStatus,
  ProjectMetrics,
  ActivityItem,
} from "@/services/types";
import { CrossModuleLinkDialog } from "@/features/relations/cross-module-link-dialog";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  compass: Compass,
  mountain: Mountain,
  trees: Trees,
  cloudRain: CloudRain,
  sun: Sun,
};

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();

  const [project, setProject] = React.useState<Project | undefined>(undefined);
  const [metrics, setMetrics] = React.useState<ProjectMetrics | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [diagrams, setDiagrams] = React.useState<Diagram[]>([]);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);

  // Cross-Module Linking Dialog state
  const [linkTarget, setLinkTarget] = React.useState<{
    type: "task" | "note" | "diagram";
    id: string;
    title: string;
  } | null>(null);

  // Edit form state
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<ProjectStatus>("active");
  const [editTargetDate, setEditTargetDate] = React.useState("");
  const [editBiome, setEditBiome] = React.useState("");

  // Add task state
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  const loadData = React.useCallback(() => {
    const p = EarthService.getProjectById(projectId);
    setProject(p);

    if (p) {
      setEditName(p.name);
      setEditDescription(p.description);
      setEditStatus(p.status);
      setEditTargetDate(p.targetDate || "");
      setEditBiome(p.biome);

      setMetrics(EarthService.getProjectMetrics(projectId));
      setTasks(EarthService.getTasks(projectId));
      setNotes(EarthService.getNotes(projectId));
      setDiagrams(EarthService.getDiagrams(projectId));
      setActivities(EarthService.getProjectActivities(projectId, 8));
    }
  }, [projectId]);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("earth-data-updated", handleUpdate);
    return () => window.removeEventListener("earth-data-updated", handleUpdate);
  }, [loadData]);

  if (!project || !metrics) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl">Project Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The requested territory project does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/projects">Return to Territory Projects</Link>
        </Button>
      </div>
    );
  }

  const isArchived = project.status === "archived";

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Project name cannot be empty.");
      return;
    }

    EarthService.updateProject(project.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      status: editStatus,
      targetDate: editTargetDate || undefined,
      biome: editBiome,
    });

    setIsEditDialogOpen(false);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Project Updated", { description: "Project metadata saved." });
  };

  const handleToggleArchive = () => {
    if (isArchived) {
      EarthService.restoreProject(project.id);
      toast.success("Project Restored", { description: "Project is now active." });
    } else {
      EarthService.archiveProject(project.id);
      toast.info("Project Archived", { description: "Project moved to archive." });
    }
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
  };

  const handleDelete = () => {
    EarthService.deleteProject(project.id);
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.info("Project Deleted", { description: "Project and records purged." });
    router.push("/projects");
  };

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    EarthService.updateTaskStatus(task.id, nextStatus);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    EarthService.createTask({
      projectId: project.id,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || undefined,
    });

    setNewTaskTitle("");
    setNewTaskDueDate("");
    setIsAddTaskDialogOpen(false);
    loadData();
    window.dispatchEvent(new Event("earth-data-updated"));
    toast.success("Task Added", { description: "Task logged to project." });
  };

  return (
    <div className="space-y-6">
      {/* Description & Action Toolbar Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card/60">
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          {project.description || "No project description provided."}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-8 text-xs"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Project
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleArchive}
            className="h-8 text-xs"
          >
            {isArchived ? (
              <>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-earth-olive" /> Restore
              </>
            ) : (
              <>
                <Archive className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Archive
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            title="Delete Project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards: Derived mathematically from project and task data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion */}
        <Card className="p-4 space-y-2 border-earth-terracotta/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px]">Completion</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-earth-olive" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-medium text-foreground">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-muted-foreground">
              {metrics.completedTasks} / {metrics.totalTasks} done
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-earth-terracotta h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </Card>

        {/* Metric 2: Open Work */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px]">Open Tasks</span>
            <Clock className="h-3.5 w-3.5 text-earth-terracotta" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-medium text-foreground">
              {metrics.todoTasks + metrics.inProgressTasks}
            </span>
            {metrics.overdueTasks > 0 ? (
              <Badge variant="outline" className="text-destructive border-destructive/40 text-[10px]">
                {metrics.overdueTasks} Overdue
              </Badge>
            ) : (
              <span className="text-xs text-earth-olive font-medium">On Track</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metrics.todoTasks} Todo &bull; {metrics.inProgressTasks} In Progress
          </p>
        </Card>

        {/* Metric 3: Priorities */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px]">Priority Focus</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="text-center">
              <span className="font-serif text-xl font-medium text-red-600 dark:text-red-400">
                {metrics.byPriority.urgent}
              </span>
              <p className="text-[9px] uppercase font-mono text-muted-foreground">Urgent</p>
            </div>
            <div className="text-center">
              <span className="font-serif text-xl font-medium text-amber-600 dark:text-amber-400">
                {metrics.byPriority.high}
              </span>
              <p className="text-[9px] uppercase font-mono text-muted-foreground">High</p>
            </div>
            <div className="text-center">
              <span className="font-serif text-xl font-medium text-foreground">
                {metrics.byPriority.medium}
              </span>
              <p className="text-[9px] uppercase font-mono text-muted-foreground">Med</p>
            </div>
            <div className="text-center">
              <span className="font-serif text-xl font-medium text-muted-foreground">
                {metrics.byPriority.low}
              </span>
              <p className="text-[9px] uppercase font-mono text-muted-foreground">Low</p>
            </div>
          </div>
        </Card>

        {/* Metric 4: Knowledge Assets */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase text-[10px]">Knowledge Assets</span>
            <Share2 className="h-3.5 w-3.5 text-earth-olive" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-medium text-foreground">
              {metrics.totalNotes + metrics.totalDiagrams}
            </span>
            <span className="text-xs text-muted-foreground">
              {metrics.connectedTasks.length} linked tasks
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metrics.totalNotes} Notes &bull; {metrics.totalDiagrams} Diagrams
          </p>
        </Card>
      </div>

      {/* Main Grid: Tasks & Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tasks & Cross-Module Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Priority & Upcoming Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-earth-olive" />
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Field Tasks ({tasks.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link href={`/projects/${project.id}/board`}>
                    <Columns className="mr-1 h-3 w-3 text-earth-terracotta" /> Kanban Board
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setIsAddTaskDialogOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Task
                </Button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                No tasks logged yet for this project.
              </div>
            ) : (
              <Card className="divide-y divide-border/60">
                {tasks.slice(0, 6).map((task) => {
                  const isDone = task.status === "completed";
                  const hasLinks =
                    (task.linkedNoteIds && task.linkedNoteIds.length > 0) ||
                    (task.linkedDiagramIds && task.linkedDiagramIds.length > 0);

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start justify-between p-3.5 gap-3 transition-colors hover:bg-muted/20 text-xs",
                        isDone && "opacity-60 bg-muted/10"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            isDone
                              ? "bg-earth-olive border-earth-olive text-white"
                              : "border-input hover:border-earth-terracotta"
                          )}
                          aria-label="Toggle task completion"
                        >
                          {isDone && <CheckCircle2 className="h-3 w-3" />}
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "font-medium text-foreground truncate",
                                isDone && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setLinkTarget({
                              type: "task",
                              id: task.id,
                              title: task.title,
                            })
                          }
                          title="Manage connected relationships"
                        >
                          <Share2 className="h-3 w-3 mr-1 text-earth-terracotta" />
                          <span>
                            {(task.linkedNoteIds?.length || 0) +
                              (task.linkedDiagramIds?.length || 0)}{" "}
                            links
                          </span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}
          </div>

          {/* Section: Connected Work Pipeline (Tasks originating from or linked to notes/diagrams) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-earth-terracotta" />
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Cross-Module Pipeline ({metrics.connectedTasks.length})
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Tasks connected to technical notes or architecture topologies
              </span>
            </div>

            {metrics.connectedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                No connected items yet. Use the Link dialog to attach research notes and architecture diagrams to tasks.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics.connectedTasks.slice(0, 4).map((task) => (
                  <Card key={task.id} className="p-3.5 space-y-2 text-xs hover:border-earth-terracotta/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{task.title}</span>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {task.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                      {task.linkedNoteIds && task.linkedNoteIds.length > 0 && (
                        <span className="flex items-center gap-1 text-earth-terracotta">
                          <FileText className="h-3 w-3" /> {task.linkedNoteIds.length} Notes
                        </span>
                      )}
                      {task.linkedDiagramIds && task.linkedDiagramIds.length > 0 && (
                        <span className="flex items-center gap-1 text-earth-olive">
                          <Network className="h-3 w-3" /> {task.linkedDiagramIds.length} Diags
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-1 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-earth-terracotta hover:bg-earth-terracotta/10 px-2"
                        onClick={() =>
                          setLinkTarget({
                            type: "task",
                            id: task.id,
                            title: task.title,
                          })
                        }
                      >
                        Manage Links &rarr;
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Knowledge Base, Diagrams, & Activity */}
        <div className="space-y-6">
          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-earth-terracotta" />
                <h3 className="font-serif text-lg font-normal">
                  Knowledge Base ({notes.length})
                </h3>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-earth-terracotta">
                <Link href={`/projects/${project.id}/notes`}>Open &rarr;</Link>
              </Button>
            </div>

            {notes.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                No research notes drafted.
              </div>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 3).map((note) => (
                  <Link key={note.id} href={`/projects/${project.id}/notes`} className="block">
                    <Card className="p-3 space-y-1 text-xs hover:border-earth-terracotta/40 transition-colors">
                      <p className="font-medium text-foreground truncate">{note.title}</p>
                      <p className="text-muted-foreground line-clamp-1 text-[11px]">
                        {note.content.replace(/^#+ .*\n*/, "")}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="muted" size="sm" className="text-[8px] py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Diagrams Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-earth-olive" />
                <h3 className="font-serif text-lg font-normal">
                  Architecture ({diagrams.length})
                </h3>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-earth-olive">
                <Link href={`/projects/${project.id}/sketch`}>Canvas &rarr;</Link>
              </Button>
            </div>

            {diagrams.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                No topology diagrams drafted.
              </div>
            ) : (
              <div className="space-y-2">
                {diagrams.slice(0, 3).map((diag) => (
                  <Link key={diag.id} href={`/projects/${project.id}/sketch`} className="block">
                    <Card className="p-3 space-y-1 text-xs hover:border-earth-olive/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground truncate">{diag.title}</p>
                        <span className="text-[9px] uppercase font-mono text-muted-foreground">
                          {diag.nodeCount} nodes
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {diag.description || "Interactive system topology"}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-serif text-lg font-normal">Recent Activity</h3>
            </div>

            {activities.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                No recorded actions yet.
              </div>
            ) : (
              <Card className="p-3 space-y-3 text-xs divide-y divide-border/60">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="pt-2 first:pt-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-foreground">{act.user}</span>
                      <span className="text-muted-foreground text-[10px]">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="capitalize">{act.action}</span> &ldquo;
                      <span className="font-medium text-foreground">{act.target}</span>&rdquo;
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cross-Module Linking Dialog */}
      {linkTarget && (
        <CrossModuleLinkDialog
          projectId={project.id}
          sourceType={linkTarget.type}
          sourceId={linkTarget.id}
          sourceTitle={linkTarget.title}
          open={Boolean(linkTarget)}
          onOpenChange={(open) => !open && setLinkTarget(null)}
          onRelationshipsChanged={loadData}
        />
      )}

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>Edit Territory Project</DialogTitle>
              <DialogDescription>
                Modify project metadata, operational scope, or scheduling.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" required>Project Title</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as ProjectStatus)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-target-date">Target Date</Label>
                  <Input
                    id="edit-target-date"
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-biome">Biome / Territory Domain</Label>
                <Input
                  id="edit-biome"
                  value={editBiome}
                  onChange={(e) => setEditBiome(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Territory Project?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{project.name}&rdquo;?
              All associated tasks, knowledge notes, and architecture diagrams will be removed safely.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Add Project Task</DialogTitle>
              <DialogDescription>
                Create a quick task in this project&apos;s workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-task-title" required>Task Title</Label>
                <Input
                  id="new-task-title"
                  placeholder="e.g. Deploy soil microclimate loggers"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-task-due">Due Date</Label>
                <Input
                  id="new-task-due"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
