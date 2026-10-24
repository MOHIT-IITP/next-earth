import {
  Project,
  Task,
  Note,
  Diagram,
  ActivityItem,
  DashboardMetrics,
  ProjectMetrics,
  RelatedItemReference,
  ProjectStatus,
  TaskStatus,
  KanbanColumn,
} from "./types";
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_DIAGRAMS,
  INITIAL_ACTIVITIES,
  DEFAULT_KANBAN_COLUMNS,
} from "./mock-data";

const STORAGE_PROJECTS_KEY = "earth_v3_projects";
const STORAGE_TASKS_KEY = "earth_v3_tasks";
const STORAGE_NOTES_KEY = "earth_v3_notes";
const STORAGE_DIAGRAMS_KEY = "earth_v3_diagrams";
const STORAGE_ACTIVITIES_KEY = "earth_v3_activities";
const STORAGE_COLUMNS_KEY = "earth_v3_columns";

export class EarthService {
  private static memoryStore = new Map<string, any>();

  private static getStored<T>(key: string, fallback: T): T {
    if (typeof localStorage === "undefined") {
      if (this.memoryStore.has(key)) {
        return this.memoryStore.get(key) as T;
      }
      return fallback;
    }
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, data: T): void {
    if (typeof localStorage === "undefined") {
      this.memoryStore.set(key, data);
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }

  // --- Kanban Columns ---
  static getColumns(projectId: string): KanbanColumn[] {
    const allCols = this.getStored<Record<string, KanbanColumn[]>>(
      STORAGE_COLUMNS_KEY,
      {}
    );

    if (!allCols[projectId] || allCols[projectId].length === 0) {
      // Generate default columns for this project
      const defaults: KanbanColumn[] = DEFAULT_KANBAN_COLUMNS.map((col) => ({
        ...col,
        projectId,
      }));
      allCols[projectId] = defaults;
      this.setStored(STORAGE_COLUMNS_KEY, allCols);
      return defaults;
    }

    return [...allCols[projectId]].sort((a, b) => a.order - b.order);
  }

  static addColumn(projectId: string, title: string): KanbanColumn {
    const columns = this.getColumns(projectId);
    const trimmed = title.trim();
    if (!trimmed) throw new Error("Column title cannot be empty.");

    const id = `col-${Date.now()}`;
    const newCol: KanbanColumn = {
      id,
      projectId,
      title: trimmed,
      order: columns.length,
    };

    const updated = [...columns, newCol];
    const allCols = this.getStored<Record<string, KanbanColumn[]>>(
      STORAGE_COLUMNS_KEY,
      {}
    );
    allCols[projectId] = updated;
    this.setStored(STORAGE_COLUMNS_KEY, allCols);

    this.addActivity({
      projectId,
      user: "Current User",
      action: "created column",
      target: trimmed,
      iconType: "project",
    });

    return newCol;
  }

  static updateColumn(projectId: string, columnId: string, title: string): KanbanColumn {
    const columns = this.getColumns(projectId);
    const index = columns.findIndex((c) => c.id === columnId);
    if (index === -1) throw new Error("Column not found.");

    const trimmed = title.trim();
    if (!trimmed) throw new Error("Column title cannot be empty.");

    columns[index] = { ...columns[index], title: trimmed };
    const allCols = this.getStored<Record<string, KanbanColumn[]>>(
      STORAGE_COLUMNS_KEY,
      {}
    );
    allCols[projectId] = columns;
    this.setStored(STORAGE_COLUMNS_KEY, allCols);

    return columns[index];
  }

  static reorderColumns(projectId: string, columnIds: string[]): KanbanColumn[] {
    const columns = this.getColumns(projectId);
    const map = new Map(columns.map((c) => [c.id, c]));

    const reordered: KanbanColumn[] = [];
    columnIds.forEach((id, index) => {
      const col = map.get(id);
      if (col) {
        reordered.push({ ...col, order: index });
      }
    });

    const allCols = this.getStored<Record<string, KanbanColumn[]>>(
      STORAGE_COLUMNS_KEY,
      {}
    );
    allCols[projectId] = reordered;
    this.setStored(STORAGE_COLUMNS_KEY, allCols);

    return reordered;
  }

  static removeColumn(
    projectId: string,
    columnId: string,
    targetColumnId?: string
  ): void {
    const columns = this.getColumns(projectId);
    const tasksInColumn = this.getTasks(projectId).filter((t) => t.columnId === columnId);

    if (tasksInColumn.length > 0 && !targetColumnId) {
      throw new Error(
        `Column contains ${tasksInColumn.length} tasks. Please select a destination column to migrate them before deleting.`
      );
    }

    // Migrate tasks if target column specified
    if (tasksInColumn.length > 0 && targetColumnId) {
      const allTasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
      const migrated = allTasks.map((t) => {
        if (t.projectId === projectId && t.columnId === columnId) {
          const status = this.deriveStatusFromColumn(targetColumnId);
          return {
            ...t,
            columnId: targetColumnId,
            status,
            completedAt: status === "completed" ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      this.setStored(STORAGE_TASKS_KEY, migrated);
    }

    const filtered = columns
      .filter((c) => c.id !== columnId)
      .map((c, i) => ({ ...c, order: i }));

    const allCols = this.getStored<Record<string, KanbanColumn[]>>(
      STORAGE_COLUMNS_KEY,
      {}
    );
    allCols[projectId] = filtered;
    this.setStored(STORAGE_COLUMNS_KEY, allCols);
  }

  public static deriveStatusFromColumn(columnId: string): TaskStatus {
    const lower = columnId.toLowerCase();
    if (lower.includes("done") || lower.includes("completed") || lower.includes("finish")) return "completed";
    if (lower.includes("progress") || lower.includes("review") || lower.includes("testing")) return "in_progress";
    return "todo";
  }

  // --- Projects ---
  static getProjects(options?: {
    search?: string;
    status?: ProjectStatus | "all";
    sort?: "updated" | "name" | "targetDate";
  }): Project[] {
    let list = this.getStored<Project[]>(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS);

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.biome.toLowerCase().includes(q)
      );
    }

    if (options?.status && options.status !== "all") {
      list = list.filter((p) => p.status === options.status);
    }

    if (options?.sort) {
      list = [...list].sort((a, b) => {
        if (options.sort === "name") return a.name.localeCompare(b.name);
        if (options.sort === "targetDate") {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    return list;
  }

  static getProjectById(id: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id);
  }

  static createProject(data: {
    name: string;
    description: string;
    icon: string;
    status?: ProjectStatus;
    targetDate?: string;
    accent?: Project["accent"];
    biome?: string;
  }): Project {
    const projects = this.getStored<Project[]>(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS);

    const existing = projects.find(
      (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`A project with the name "${data.name}" already exists.`);
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const now = new Date().toISOString();

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      icon: data.icon || "compass",
      status: data.status || "active",
      targetDate: data.targetDate || undefined,
      accent: data.accent || "terracotta",
      biome: data.biome || "Terrestrial Biosphere",
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newProject, ...projects];
    this.setStored(STORAGE_PROJECTS_KEY, updated);

    // Initialize default columns for the new project
    this.getColumns(newProject.id);

    this.addActivity({
      projectId: newProject.id,
      projectName: newProject.name,
      user: "Current User",
      action: "created project",
      target: newProject.name,
      iconType: "project",
    });

    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project {
    const projects = this.getStored<Project[]>(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS);
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Project not found.");
    }

    const updatedProject: Project = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updatedProject;
    this.setStored(STORAGE_PROJECTS_KEY, projects);

    this.addActivity({
      projectId: updatedProject.id,
      projectName: updatedProject.name,
      user: "Current User",
      action: "updated project settings",
      target: updatedProject.name,
      iconType: "project",
    });

    return updatedProject;
  }

  static archiveProject(id: string): Project {
    return this.updateProject(id, { status: "archived" });
  }

  static restoreProject(id: string): Project {
    return this.updateProject(id, { status: "active" });
  }

  static deleteProject(id: string): void {
    const projects = this.getStored<Project[]>(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS);
    const target = projects.find((p) => p.id === id);
    const filtered = projects.filter((p) => p.id !== id);
    this.setStored(STORAGE_PROJECTS_KEY, filtered);

    // Cascading cleanups for project items
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    this.setStored(
      STORAGE_TASKS_KEY,
      tasks.filter((t) => t.projectId !== id)
    );

    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    this.setStored(
      STORAGE_NOTES_KEY,
      notes.filter((n) => n.projectId !== id)
    );

    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    this.setStored(
      STORAGE_DIAGRAMS_KEY,
      diagrams.filter((d) => d.projectId !== id)
    );

    if (target) {
      this.addActivity({
        projectId: id,
        projectName: target.name,
        user: "Current User",
        action: "deleted project",
        target: target.name,
        iconType: "project",
      });
    }
  }

  // --- Tasks ---
  static getTasks(projectId?: string): Task[] {
    let list = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    if (projectId) {
      list = list.filter((t) => t.projectId === projectId);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  static getTaskById(taskId: string): Task | undefined {
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    return tasks.find((t) => t.id === taskId);
  }

  static createTask(data: {
    projectId: string;
    title: string;
    description?: string;
    columnId?: string;
    type?: Task["type"];
    priority?: Task["priority"];
    labels?: string[];
    dueDate?: string;
    linkedNoteIds?: string[];
    linkedDiagramIds?: string[];
  }): Task {
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const now = new Date().toISOString();

    const columnId = data.columnId || "col-todo";
    const status = this.deriveStatusFromColumn(columnId);

    const tasksInCol = tasks.filter(
      (t) => t.projectId === data.projectId && t.columnId === columnId
    );

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: data.projectId,
      columnId,
      order: tasksInCol.length,
      title: data.title.trim(),
      description: data.description?.trim(),
      type: data.type || "research",
      status,
      priority: data.priority || "medium",
      labels: data.labels || ["Field"],
      dueDate: data.dueDate,
      checklists: [],
      linkedNoteIds: data.linkedNoteIds || [],
      linkedDiagramIds: data.linkedDiagramIds || [],
      completedAt: status === "completed" ? now : undefined,
      createdAt: now,
      updatedAt: now,
      assigneeName: "Current User",
    };

    this.setStored(STORAGE_TASKS_KEY, [newTask, ...tasks]);

    const project = this.getProjectById(data.projectId);
    this.addActivity({
      projectId: data.projectId,
      projectName: project?.name,
      user: "Current User",
      action: "created task",
      target: newTask.title,
      iconType: "task",
    });

    return newTask;
  }

  static updateTask(taskId: string, updates: Partial<Task>): Task {
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error("Task not found.");

    const now = new Date().toISOString();
    let status = updates.status || tasks[index].status;

    // If column changed, derive status
    if (updates.columnId && updates.columnId !== tasks[index].columnId) {
      status = this.deriveStatusFromColumn(updates.columnId);
    }

    const updated: Task = {
      ...tasks[index],
      ...updates,
      status,
      completedAt: status === "completed" ? (tasks[index].completedAt || now) : undefined,
      updatedAt: now,
    };

    tasks[index] = updated;
    this.setStored(STORAGE_TASKS_KEY, tasks);
    return updated;
  }

  static moveTask(taskId: string, targetColumnId: string, targetOrder?: number): Task {
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error("Task not found.");

    const task = tasks[index];
    const now = new Date().toISOString();
    const newStatus = this.deriveStatusFromColumn(targetColumnId);

    const oldColumnId = task.columnId;
    const sameColumn = oldColumnId === targetColumnId;

    let colTasks = tasks
      .filter((t) => t.projectId === task.projectId && t.columnId === targetColumnId && t.id !== taskId)
      .sort((a, b) => a.order - b.order);

    const destinationOrder =
      targetOrder !== undefined
        ? Math.max(0, Math.min(targetOrder, colTasks.length))
        : colTasks.length;

    // Insert task at destination order
    colTasks.splice(destinationOrder, 0, {
      ...task,
      columnId: targetColumnId,
      status: newStatus,
      completedAt: newStatus === "completed" ? (task.completedAt || now) : undefined,
      updatedAt: now,
    });

    // Reindex orders in target column
    const orderMap = new Map<string, number>();
    colTasks.forEach((t, i) => orderMap.set(t.id, i));

    const updatedTasks = tasks.map((t) => {
      if (orderMap.has(t.id)) {
        return {
          ...t,
          columnId: targetColumnId,
          order: orderMap.get(t.id)!,
          status: newStatus,
          completedAt: newStatus === "completed" ? (t.completedAt || now) : undefined,
          updatedAt: now,
        };
      }
      return t;
    });

    this.setStored(STORAGE_TASKS_KEY, updatedTasks);

    const project = this.getProjectById(task.projectId);
    this.addActivity({
      projectId: task.projectId,
      projectName: project?.name,
      user: "Current User",
      action: "moved task",
      target: `${task.title} to ${targetColumnId.replace("col-", "")}`,
      iconType: "task",
    });

    return updatedTasks.find((t) => t.id === taskId)!;
  }

  static duplicateTask(taskId: string): Task {
    const original = this.getTaskById(taskId);
    if (!original) throw new Error("Original task not found.");

    return this.createTask({
      projectId: original.projectId,
      title: `${original.title} (Copy)`,
      description: original.description,
      columnId: original.columnId,
      type: original.type,
      priority: original.priority,
      labels: [...original.labels],
      dueDate: original.dueDate,
      linkedNoteIds: original.linkedNoteIds ? [...original.linkedNoteIds] : [],
      linkedDiagramIds: original.linkedDiagramIds ? [...original.linkedDiagramIds] : [],
    });
  }

  static deleteTask(taskId: string): void {
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const target = tasks.find((t) => t.id === taskId);
    const filtered = tasks.filter((t) => t.id !== taskId);
    this.setStored(STORAGE_TASKS_KEY, filtered);

    // Safely remove references from all notes
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    const updatedNotes = notes.map((n) => {
      if (n.linkedTaskIds?.includes(taskId)) {
        return {
          ...n,
          linkedTaskIds: n.linkedTaskIds.filter((id) => id !== taskId),
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    this.setStored(STORAGE_NOTES_KEY, updatedNotes);

    // Safely remove references from all diagrams
    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    const updatedDiagrams = diagrams.map((d) => {
      if (d.linkedTaskIds?.includes(taskId)) {
        return {
          ...d,
          linkedTaskIds: d.linkedTaskIds.filter((id) => id !== taskId),
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    this.setStored(STORAGE_DIAGRAMS_KEY, updatedDiagrams);

    if (target) {
      this.addActivity({
        projectId: target.projectId,
        user: "Current User",
        action: "deleted task",
        target: target.title,
        iconType: "task",
      });
    }
  }

  static updateTaskStatus(taskId: string, status: TaskStatus): Task {
    let targetColumn = "col-todo";
    if (status === "completed") targetColumn = "col-done";
    else if (status === "in_progress") targetColumn = "col-in_progress";

    return this.moveTask(taskId, targetColumn);
  }

  // --- Cross-module Linking ---
  static attachNoteToTask(taskId: string, noteId: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error("Task not found");
    const current = task.linkedNoteIds || [];
    if (!current.includes(noteId)) {
      return this.updateTask(taskId, { linkedNoteIds: [...current, noteId] });
    }
    return task;
  }

  static detachNoteFromTask(taskId: string, noteId: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error("Task not found");
    const current = task.linkedNoteIds || [];
    return this.updateTask(taskId, {
      linkedNoteIds: current.filter((id) => id !== noteId),
    });
  }

  static attachDiagramToTask(taskId: string, diagramId: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error("Task not found");
    const current = task.linkedDiagramIds || [];
    if (!current.includes(diagramId)) {
      return this.updateTask(taskId, { linkedDiagramIds: [...current, diagramId] });
    }
    return task;
  }

  static detachDiagramFromTask(taskId: string, diagramId: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error("Task not found");
    const current = task.linkedDiagramIds || [];
    return this.updateTask(taskId, {
      linkedDiagramIds: current.filter((id) => id !== diagramId),
    });
  }

  // --- Notes ---
  static getNotes(
    projectId?: string,
    options?: {
      search?: string;
      tag?: string;
      sort?: "updated" | "created" | "title";
    }
  ): Note[] {
    let list = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    if (projectId) {
      list = list.filter((n) => n.projectId === projectId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options?.tag && options.tag !== "all") {
      list = list.filter((n) => n.tags.includes(options.tag!));
    }

    if (options?.sort === "created") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (options?.sort === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return list;
  }

  static getNoteById(id: string): Note | undefined {
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    return notes.find((n) => n.id === id);
  }

  static createNote(data: {
    projectId: string;
    title: string;
    content?: string;
    tags?: string[];
    linkedTaskIds?: string[];
    linkedDiagramIds?: string[];
  }): Note {
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      projectId: data.projectId,
      title: data.title.trim(),
      content: data.content !== undefined ? data.content : "# " + data.title.trim() + "\n\n",
      tags: data.tags || ["Field Observation"],
      linkedTaskIds: data.linkedTaskIds || [],
      linkedDiagramIds: data.linkedDiagramIds || [],
      createdAt: now,
      updatedAt: now,
    };

    this.setStored(STORAGE_NOTES_KEY, [newNote, ...notes]);

    const project = this.getProjectById(data.projectId);
    this.addActivity({
      projectId: data.projectId,
      projectName: project?.name,
      user: "Current User",
      action: "logged note",
      target: newNote.title,
      iconType: "note",
    });

    return newNote;
  }

  static updateNote(noteId: string, updates: Partial<Note>): Note {
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    const index = notes.findIndex((n) => n.id === noteId);
    if (index === -1) throw new Error("Note not found.");

    const updatedNote: Note = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    notes[index] = updatedNote;
    this.setStored(STORAGE_NOTES_KEY, notes);
    return updatedNote;
  }

  static duplicateNote(noteId: string): Note {
    const original = this.getNoteById(noteId);
    if (!original) throw new Error("Original note not found.");

    return this.createNote({
      projectId: original.projectId,
      title: `${original.title} (Copy)`,
      content: original.content,
      tags: [...original.tags],
      linkedTaskIds: original.linkedTaskIds ? [...original.linkedTaskIds] : [],
      linkedDiagramIds: original.linkedDiagramIds ? [...original.linkedDiagramIds] : [],
    });
  }

  static deleteNote(noteId: string): void {
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    const target = notes.find((n) => n.id === noteId);
    const filtered = notes.filter((n) => n.id !== noteId);
    this.setStored(STORAGE_NOTES_KEY, filtered);

    // Safely remove references from all tasks
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const updatedTasks = tasks.map((t) => {
      if (t.linkedNoteIds?.includes(noteId)) {
        return {
          ...t,
          linkedNoteIds: t.linkedNoteIds.filter((id) => id !== noteId),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.setStored(STORAGE_TASKS_KEY, updatedTasks);

    // Safely remove references from all diagrams
    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    const updatedDiagrams = diagrams.map((d) => {
      if (d.linkedNoteIds?.includes(noteId)) {
        return {
          ...d,
          linkedNoteIds: d.linkedNoteIds.filter((id) => id !== noteId),
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    this.setStored(STORAGE_DIAGRAMS_KEY, updatedDiagrams);

    if (target) {
      this.addActivity({
        projectId: target.projectId,
        user: "Current User",
        action: "deleted note",
        target: target.title,
        iconType: "note",
      });
    }
  }

  static attachTaskToNote(noteId: string, taskId: string): Note {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error("Note not found.");
    const current = note.linkedTaskIds || [];
    if (!current.includes(taskId)) {
      const updated = this.updateNote(noteId, { linkedTaskIds: [...current, taskId] });
      // Sync other direction
      this.attachNoteToTask(taskId, noteId);
      return updated;
    }
    return note;
  }

  static detachTaskFromNote(noteId: string, taskId: string): Note {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error("Note not found.");
    const current = note.linkedTaskIds || [];
    const updated = this.updateNote(noteId, {
      linkedTaskIds: current.filter((id) => id !== taskId),
    });
    // Sync other direction
    this.detachNoteFromTask(taskId, noteId);
    return updated;
  }

  static attachDiagramToNote(noteId: string, diagramId: string): Note {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error("Note not found.");
    const current = note.linkedDiagramIds || [];
    if (!current.includes(diagramId)) {
      return this.updateNote(noteId, { linkedDiagramIds: [...current, diagramId] });
    }
    return note;
  }

  static detachDiagramFromNote(noteId: string, diagramId: string): Note {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error("Note not found.");
    const current = note.linkedDiagramIds || [];
    return this.updateNote(noteId, {
      linkedDiagramIds: current.filter((id) => id !== diagramId),
    });
  }

  // --- Diagrams ---
  static getDiagrams(projectId?: string): Diagram[] {
    let list = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    if (projectId) {
      list = list.filter((d) => d.projectId === projectId);
    }
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static getDiagramById(id: string): Diagram | undefined {
    const list = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    return list.find((d) => d.id === id);
  }

  static createDiagram(data: {
    projectId: string;
    title: string;
    description?: string;
    type?: Diagram["type"];
    canvasData?: any;
    nodeCount?: number;
    edgeCount?: number;
    linkedTaskIds?: string[];
    linkedNoteIds?: string[];
  }): Diagram {
    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    const now = new Date().toISOString();

    const newDiagram: Diagram = {
      id: `diag-${Date.now()}`,
      projectId: data.projectId,
      title: data.title.trim(),
      description: data.description?.trim(),
      type: data.type || "architecture",
      nodeCount: data.nodeCount ?? data.canvasData?.nodes?.length ?? 0,
      edgeCount: data.edgeCount ?? data.canvasData?.edges?.length ?? 0,
      canvasData: data.canvasData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      linkedTaskIds: data.linkedTaskIds || [],
      linkedNoteIds: data.linkedNoteIds || [],
      createdAt: now,
      updatedAt: now,
    };

    this.setStored(STORAGE_DIAGRAMS_KEY, [newDiagram, ...diagrams]);

    const project = this.getProjectById(data.projectId);
    this.addActivity({
      projectId: data.projectId,
      projectName: project?.name,
      user: "Current User",
      action: "designed diagram",
      target: newDiagram.title,
      iconType: "diagram",
    });

    return newDiagram;
  }

  static updateDiagram(id: string, updates: Partial<Diagram>): Diagram {
    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    const index = diagrams.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Diagram not found.");

    const updated: Diagram = {
      ...diagrams[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    diagrams[index] = updated;
    this.setStored(STORAGE_DIAGRAMS_KEY, diagrams);
    return updated;
  }

  static saveDiagramCanvas(
    id: string,
    canvasData: any,
    nodeCount?: number,
    edgeCount?: number
  ): Diagram {
    return this.updateDiagram(id, {
      canvasData,
      nodeCount: nodeCount ?? canvasData?.nodes?.length ?? 0,
      edgeCount: edgeCount ?? canvasData?.edges?.length ?? 0,
    });
  }

  static duplicateDiagram(id: string): Diagram {
    const original = this.getDiagramById(id);
    if (!original) throw new Error("Original diagram not found.");

    return this.createDiagram({
      projectId: original.projectId,
      title: `${original.title} (Copy)`,
      description: original.description,
      type: original.type,
      canvasData: original.canvasData ? JSON.parse(JSON.stringify(original.canvasData)) : undefined,
      linkedTaskIds: original.linkedTaskIds ? [...original.linkedTaskIds] : [],
      linkedNoteIds: original.linkedNoteIds ? [...original.linkedNoteIds] : [],
    });
  }

  static deleteDiagram(id: string): void {
    const diagrams = this.getStored<Diagram[]>(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
    const target = diagrams.find((d) => d.id === id);
    const filtered = diagrams.filter((d) => d.id !== id);
    this.setStored(STORAGE_DIAGRAMS_KEY, filtered);

    // Safely remove references from all tasks
    const tasks = this.getStored<Task[]>(STORAGE_TASKS_KEY, INITIAL_TASKS);
    const updatedTasks = tasks.map((t) => {
      if (t.linkedDiagramIds?.includes(id)) {
        return {
          ...t,
          linkedDiagramIds: t.linkedDiagramIds.filter((diagId) => diagId !== id),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    this.setStored(STORAGE_TASKS_KEY, updatedTasks);

    // Safely remove references from all notes
    const notes = this.getStored<Note[]>(STORAGE_NOTES_KEY, INITIAL_NOTES);
    const updatedNotes = notes.map((n) => {
      if (n.linkedDiagramIds?.includes(id)) {
        return {
          ...n,
          linkedDiagramIds: n.linkedDiagramIds.filter((diagId) => diagId !== id),
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    this.setStored(STORAGE_NOTES_KEY, updatedNotes);

    if (target) {
      this.addActivity({
        projectId: target.projectId,
        user: "Current User",
        action: "deleted diagram",
        target: target.title,
        iconType: "diagram",
      });
    }
  }

  static attachTaskToDiagram(diagramId: string, taskId: string): Diagram {
    const diag = this.getDiagramById(diagramId);
    if (!diag) throw new Error("Diagram not found.");
    const current = diag.linkedTaskIds || [];
    if (!current.includes(taskId)) {
      const updated = this.updateDiagram(diagramId, { linkedTaskIds: [...current, taskId] });
      this.attachDiagramToTask(taskId, diagramId);
      return updated;
    }
    return diag;
  }

  static detachTaskFromDiagram(diagramId: string, taskId: string): Diagram {
    const diag = this.getDiagramById(diagramId);
    if (!diag) throw new Error("Diagram not found.");
    const current = diag.linkedTaskIds || [];
    const updated = this.updateDiagram(diagramId, {
      linkedTaskIds: current.filter((id) => id !== taskId),
    });
    this.detachDiagramFromTask(taskId, diagramId);
    return updated;
  }

  static attachNoteToDiagram(diagramId: string, noteId: string): Diagram {
    const diag = this.getDiagramById(diagramId);
    if (!diag) throw new Error("Diagram not found.");
    const current = diag.linkedNoteIds || [];
    if (!current.includes(noteId)) {
      const updated = this.updateDiagram(diagramId, { linkedNoteIds: [...current, noteId] });
      this.attachDiagramToNote(noteId, diagramId);
      return updated;
    }
    return diag;
  }

  static detachNoteFromDiagram(diagramId: string, noteId: string): Diagram {
    const diag = this.getDiagramById(diagramId);
    if (!diag) throw new Error("Diagram not found.");
    const current = diag.linkedNoteIds || [];
    const updated = this.updateDiagram(diagramId, {
      linkedNoteIds: current.filter((id) => id !== noteId),
    });
    this.detachDiagramFromNote(noteId, diagramId);
    return updated;
  }

  // --- Activity ---
  static getActivities(limit: number = 8): ActivityItem[] {
    const list = this.getStored<ActivityItem[]>(
      STORAGE_ACTIVITIES_KEY,
      INITIAL_ACTIVITIES
    );
    return list.slice(0, limit);
  }

  static getProjectActivities(projectId: string, limit: number = 20): ActivityItem[] {
    const list = this.getStored<ActivityItem[]>(
      STORAGE_ACTIVITIES_KEY,
      INITIAL_ACTIVITIES
    );
    return list
      .filter((a) => a.projectId === projectId)
      .slice(0, limit);
  }

  private static addActivity(data: Omit<ActivityItem, "id" | "timestamp">): void {
    const list = this.getStored<ActivityItem[]>(
      STORAGE_ACTIVITIES_KEY,
      INITIAL_ACTIVITIES
    );
    const newAct: ActivityItem = {
      ...data,
      id: `act-${Date.now()}`,
      timestamp: "Just now",
    };
    this.setStored(STORAGE_ACTIVITIES_KEY, [newAct, ...list]);
  }

  // --- Universal Bidirectional Cross-Module Linking ---
  static linkItems(
    typeA: "task" | "note" | "diagram",
    idA: string,
    typeB: "task" | "note" | "diagram",
    idB: string
  ): void {
    if (typeA === typeB && idA === idB) return;

    // Resolve item A
    let itemA: Task | Note | Diagram | undefined;
    if (typeA === "task") itemA = this.getTaskById(idA);
    else if (typeA === "note") itemA = this.getNoteById(idA);
    else if (typeA === "diagram") itemA = this.getDiagramById(idA);

    // Resolve item B
    let itemB: Task | Note | Diagram | undefined;
    if (typeB === "task") itemB = this.getTaskById(idB);
    else if (typeB === "note") itemB = this.getNoteById(idB);
    else if (typeB === "diagram") itemB = this.getDiagramById(idB);

    if (!itemA || !itemB) {
      throw new Error("One or both items could not be found for linking.");
    }

    // Strict project isolation: items must belong to the same project
    if (itemA.projectId !== itemB.projectId) {
      throw new Error("Cross-project relationships are prohibited. Items must belong to the same project.");
    }

    // Link A -> B
    if (typeA === "task") {
      const task = itemA as Task;
      if (typeB === "note") {
        const cur = task.linkedNoteIds || [];
        if (!cur.includes(idB)) this.updateTask(idA, { linkedNoteIds: [...cur, idB] });
      } else if (typeB === "diagram") {
        const cur = task.linkedDiagramIds || [];
        if (!cur.includes(idB)) this.updateTask(idA, { linkedDiagramIds: [...cur, idB] });
      }
    } else if (typeA === "note") {
      const note = itemA as Note;
      if (typeB === "task") {
        const cur = note.linkedTaskIds || [];
        if (!cur.includes(idB)) this.updateNote(idA, { linkedTaskIds: [...cur, idB] });
      } else if (typeB === "diagram") {
        const cur = note.linkedDiagramIds || [];
        if (!cur.includes(idB)) this.updateNote(idA, { linkedDiagramIds: [...cur, idB] });
      }
    } else if (typeA === "diagram") {
      const diag = itemA as Diagram;
      if (typeB === "task") {
        const cur = diag.linkedTaskIds || [];
        if (!cur.includes(idB)) this.updateDiagram(idA, { linkedTaskIds: [...cur, idB] });
      } else if (typeB === "note") {
        const cur = diag.linkedNoteIds || [];
        if (!cur.includes(idB)) this.updateDiagram(idA, { linkedNoteIds: [...cur, idB] });
      }
    }

    // Link B -> A (Bidirectional synchronization)
    if (typeB === "task") {
      const task = itemB as Task;
      if (typeA === "note") {
        const cur = task.linkedNoteIds || [];
        if (!cur.includes(idA)) this.updateTask(idB, { linkedNoteIds: [...cur, idA] });
      } else if (typeA === "diagram") {
        const cur = task.linkedDiagramIds || [];
        if (!cur.includes(idA)) this.updateTask(idB, { linkedDiagramIds: [...cur, idA] });
      }
    } else if (typeB === "note") {
      const note = itemB as Note;
      if (typeA === "task") {
        const cur = note.linkedTaskIds || [];
        if (!cur.includes(idA)) this.updateNote(idB, { linkedTaskIds: [...cur, idA] });
      } else if (typeA === "diagram") {
        const cur = note.linkedDiagramIds || [];
        if (!cur.includes(idA)) this.updateNote(idB, { linkedDiagramIds: [...cur, idA] });
      }
    } else if (typeB === "diagram") {
      const diag = itemB as Diagram;
      if (typeA === "task") {
        const cur = diag.linkedTaskIds || [];
        if (!cur.includes(idA)) this.updateDiagram(idB, { linkedTaskIds: [...cur, idA] });
      } else if (typeA === "note") {
        const cur = diag.linkedNoteIds || [];
        if (!cur.includes(idA)) this.updateDiagram(idB, { linkedNoteIds: [...cur, idA] });
      }
    }

    this.addActivity({
      projectId: itemA.projectId,
      user: "Current User",
      action: "linked items",
      target: `${itemA.title} ↔ ${itemB.title}`,
      iconType: "link",
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("earth-data-updated"));
    }
  }

  // Universal Unlinking (Never deletes the underlying items)
  static unlinkItems(
    typeA: "task" | "note" | "diagram",
    idA: string,
    typeB: "task" | "note" | "diagram",
    idB: string
  ): void {
    // Unlink A -> B
    if (typeA === "task") {
      const task = this.getTaskById(idA);
      if (task) {
        if (typeB === "note") {
          this.updateTask(idA, {
            linkedNoteIds: (task.linkedNoteIds || []).filter((id) => id !== idB),
          });
        } else if (typeB === "diagram") {
          this.updateTask(idA, {
            linkedDiagramIds: (task.linkedDiagramIds || []).filter((id) => id !== idB),
          });
        }
      }
    } else if (typeA === "note") {
      const note = this.getNoteById(idA);
      if (note) {
        if (typeB === "task") {
          this.updateNote(idA, {
            linkedTaskIds: (note.linkedTaskIds || []).filter((id) => id !== idB),
          });
        } else if (typeB === "diagram") {
          this.updateNote(idA, {
            linkedDiagramIds: (note.linkedDiagramIds || []).filter((id) => id !== idB),
          });
        }
      }
    } else if (typeA === "diagram") {
      const diag = this.getDiagramById(idA);
      if (diag) {
        if (typeB === "task") {
          this.updateDiagram(idA, {
            linkedTaskIds: (diag.linkedTaskIds || []).filter((id) => id !== idB),
          });
        } else if (typeB === "note") {
          this.updateDiagram(idA, {
            linkedNoteIds: (diag.linkedNoteIds || []).filter((id) => id !== idB),
          });
        }
      }
    }

    // Unlink B -> A
    if (typeB === "task") {
      const task = this.getTaskById(idB);
      if (task) {
        if (typeA === "note") {
          this.updateTask(idB, {
            linkedNoteIds: (task.linkedNoteIds || []).filter((id) => id !== idA),
          });
        } else if (typeA === "diagram") {
          this.updateTask(idB, {
            linkedDiagramIds: (task.linkedDiagramIds || []).filter((id) => id !== idA),
          });
        }
      }
    } else if (typeB === "note") {
      const note = this.getNoteById(idB);
      if (note) {
        if (typeA === "task") {
          this.updateNote(idB, {
            linkedTaskIds: (note.linkedTaskIds || []).filter((id) => id !== idA),
          });
        } else if (typeA === "diagram") {
          this.updateNote(idB, {
            linkedDiagramIds: (note.linkedDiagramIds || []).filter((id) => id !== idA),
          });
        }
      }
    } else if (typeB === "diagram") {
      const diag = this.getDiagramById(idB);
      if (diag) {
        if (typeA === "task") {
          this.updateDiagram(idB, {
            linkedTaskIds: (diag.linkedTaskIds || []).filter((id) => id !== idA),
          });
        } else if (typeA === "note") {
          this.updateDiagram(idB, {
            linkedNoteIds: (diag.linkedNoteIds || []).filter((id) => id !== idA),
          });
        }
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("earth-data-updated"));
    }
  }

  // Get Related Items for any entity with direct routes
  static getRelatedItems(
    projectId: string,
    type: "task" | "note" | "diagram",
    id: string
  ): RelatedItemReference[] {
    const results: RelatedItemReference[] = [];

    if (type === "task") {
      const task = this.getTaskById(id);
      if (!task) return results;

      // Attached Notes
      (task.linkedNoteIds || []).forEach((noteId) => {
        const note = this.getNoteById(noteId);
        if (note && note.projectId === projectId) {
          results.push({
            id: note.id,
            type: "note",
            title: note.title,
            subtitle: note.content.slice(0, 80),
            projectId,
            href: `/projects/${projectId}/notes`,
            tags: note.tags,
          });
        }
      });

      // Attached Diagrams
      (task.linkedDiagramIds || []).forEach((diagId) => {
        const diag = this.getDiagramById(diagId);
        if (diag && diag.projectId === projectId) {
          results.push({
            id: diag.id,
            type: "diagram",
            title: diag.title,
            subtitle: `${diag.nodeCount} topology nodes`,
            projectId,
            href: `/projects/${projectId}/sketch`,
          });
        }
      });
    } else if (type === "note") {
      const note = this.getNoteById(id);
      if (!note) return results;

      // Attached Tasks
      (note.linkedTaskIds || []).forEach((taskId) => {
        const task = this.getTaskById(taskId);
        if (task && task.projectId === projectId) {
          results.push({
            id: task.id,
            type: "task",
            title: task.title,
            subtitle: task.description?.slice(0, 80),
            projectId,
            href: `/projects/${projectId}/board`,
            status: task.status,
            priority: task.priority,
          });
        }
      });

      // Attached Diagrams
      (note.linkedDiagramIds || []).forEach((diagId) => {
        const diag = this.getDiagramById(diagId);
        if (diag && diag.projectId === projectId) {
          results.push({
            id: diag.id,
            type: "diagram",
            title: diag.title,
            subtitle: `${diag.nodeCount} topology nodes`,
            projectId,
            href: `/projects/${projectId}/sketch`,
          });
        }
      });
    } else if (type === "diagram") {
      const diag = this.getDiagramById(id);
      if (!diag) return results;

      // Attached Tasks
      (diag.linkedTaskIds || []).forEach((taskId) => {
        const task = this.getTaskById(taskId);
        if (task && task.projectId === projectId) {
          results.push({
            id: task.id,
            type: "task",
            title: task.title,
            subtitle: task.description?.slice(0, 80),
            projectId,
            href: `/projects/${projectId}/board`,
            status: task.status,
            priority: task.priority,
          });
        }
      });

      // Attached Notes
      (diag.linkedNoteIds || []).forEach((noteId) => {
        const note = this.getNoteById(noteId);
        if (note && note.projectId === projectId) {
          results.push({
            id: note.id,
            type: "note",
            title: note.title,
            subtitle: note.content.slice(0, 80),
            projectId,
            href: `/projects/${projectId}/notes`,
            tags: note.tags,
          });
        }
      });
    }

    return results;
  }

  // Project-wide Search with route mapping
  static searchProjectItems(
    projectId: string,
    query: string,
    typeFilter: "all" | "task" | "note" | "diagram" = "all"
  ): RelatedItemReference[] {
    const q = query.toLowerCase().trim();
    const results: RelatedItemReference[] = [];

    // Search tasks
    if (typeFilter === "all" || typeFilter === "task") {
      const tasks = this.getTasks(projectId);
      tasks.forEach((t) => {
        if (
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.labels.some((l) => l.toLowerCase().includes(q))
        ) {
          results.push({
            id: t.id,
            type: "task",
            title: t.title,
            subtitle: t.description || `${t.priority.toUpperCase()} priority &bull; ${t.type}`,
            projectId,
            href: `/projects/${projectId}/board`,
            status: t.status,
            priority: t.priority,
          });
        }
      });
    }

    // Search notes
    if (typeFilter === "all" || typeFilter === "note") {
      const notes = this.getNotes(projectId);
      notes.forEach((n) => {
        if (
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((tg) => tg.toLowerCase().includes(q))
        ) {
          results.push({
            id: n.id,
            type: "note",
            title: n.title,
            subtitle: n.content.slice(0, 90),
            projectId,
            href: `/projects/${projectId}/notes`,
            tags: n.tags,
          });
        }
      });
    }

    // Search diagrams
    if (typeFilter === "all" || typeFilter === "diagram") {
      const diagrams = this.getDiagrams(projectId);
      diagrams.forEach((d) => {
        if (
          !q ||
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
        ) {
          results.push({
            id: d.id,
            type: "diagram",
            title: d.title,
            subtitle: d.description || `${d.nodeCount} topology nodes`,
            projectId,
            href: `/projects/${projectId}/sketch`,
          });
        }
      });
    }

    return results;
  }

  // Project Metrics (Derived mathematically from tasks, notes, diagrams)
  static getProjectMetrics(projectId: string): ProjectMetrics {
    const tasks = this.getTasks(projectId);
    const notes = this.getNotes(projectId);
    const diagrams = this.getDiagrams(projectId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;

    const today = new Date("2026-10-24T23:59:59Z");
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
      urgent: tasks.filter((t) => t.priority === "urgent").length,
    };

    const upcomingTasks = tasks
      .filter((t) => t.dueDate && t.status !== "completed")
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    const connectedTasks = tasks.filter(
      (t) =>
        (t.linkedNoteIds && t.linkedNoteIds.length > 0) ||
        (t.linkedDiagramIds && t.linkedDiagramIds.length > 0)
    );

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      openTasks: todoTasks + inProgressTasks,
      overdueTasks,
      completionRate,
      byPriority,
      totalNotes: notes.length,
      totalDiagrams: diagrams.length,
      upcomingTasks,
      connectedTasks,
    };
  }

  // --- Dashboard Metrics ---
  static getDashboardMetrics(): DashboardMetrics {
    const projects = this.getProjects();
    const tasks = this.getTasks();

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const archivedProjects = projects.filter((p) => p.status === "archived").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const openTasks = tasks.filter((t) => t.status !== "completed").length;

    const today = new Date("2026-10-24T23:59:59Z");
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalProjects,
      activeProjects,
      archivedProjects,
      completedProjects,
      totalTasks,
      openTasks,
      overdueTasks,
      completedTasks,
      completionRate,
    };
  }

  static clearAllData(): void {
    if (typeof localStorage === "undefined") {
      this.memoryStore.set(STORAGE_PROJECTS_KEY, []);
      this.memoryStore.set(STORAGE_TASKS_KEY, []);
      this.memoryStore.set(STORAGE_NOTES_KEY, []);
      this.memoryStore.set(STORAGE_DIAGRAMS_KEY, []);
      this.memoryStore.set(STORAGE_ACTIVITIES_KEY, []);
      this.memoryStore.set(STORAGE_COLUMNS_KEY, {});
      return;
    }
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_DIAGRAMS_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_COLUMNS_KEY, JSON.stringify({}));
  }

  static resetToMockData(): void {
    if (typeof localStorage === "undefined") {
      this.memoryStore.set(STORAGE_PROJECTS_KEY, INITIAL_PROJECTS);
      this.memoryStore.set(STORAGE_TASKS_KEY, INITIAL_TASKS);
      this.memoryStore.set(STORAGE_NOTES_KEY, INITIAL_NOTES);
      this.memoryStore.set(STORAGE_DIAGRAMS_KEY, INITIAL_DIAGRAMS);
      this.memoryStore.set(STORAGE_ACTIVITIES_KEY, INITIAL_ACTIVITIES);
      this.memoryStore.set(STORAGE_COLUMNS_KEY, {});
      return;
    }
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(INITIAL_NOTES));
    localStorage.setItem(STORAGE_DIAGRAMS_KEY, JSON.stringify(INITIAL_DIAGRAMS));
    localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_COLUMNS_KEY, JSON.stringify({}));
  }
}
