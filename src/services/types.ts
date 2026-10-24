export type ProjectStatus = "active" | "completed" | "on_hold" | "archived";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskType = "feature" | "bug" | "enhancement" | "research" | "chore";
export type ProjectAccent = "terracotta" | "olive" | "sand" | "charcoal";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanColumn {
  id: string;
  projectId: string;
  title: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: ProjectStatus;
  targetDate?: string;
  accent: ProjectAccent;
  biome: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  order: number;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  dueDate?: string;
  checklists?: ChecklistItem[];
  linkedNoteIds?: string[];
  linkedDiagramIds?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assigneeName?: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  tags: string[];
  linkedTaskIds?: string[];
  linkedDiagramIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCanvas {
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface Diagram {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  type: "architecture" | "flowchart" | "ecosystem" | "canopy" | "soil_profile";
  nodeCount: number;
  edgeCount?: number;
  canvasData?: SerializedCanvas;
  linkedTaskIds?: string[];
  linkedNoteIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  projectId?: string;
  projectName?: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  iconType: "project" | "task" | "note" | "diagram" | "link";
  details?: string;
}

export interface RelatedItemReference {
  id: string;
  type: "task" | "note" | "diagram";
  title: string;
  subtitle?: string;
  projectId: string;
  href: string;
  status?: string;
  priority?: string;
  tags?: string[];
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  openTasks: number;
  overdueTasks: number;
  completionRate: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  totalNotes: number;
  totalDiagrams: number;
  upcomingTasks: Task[];
  connectedTasks: Task[];
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  completedProjects: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
  completionRate: number;
}
