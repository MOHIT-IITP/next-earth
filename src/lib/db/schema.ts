import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Users & Sessions ---
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role").default("researcher").notNull(),
    organization: text("organization").default("Earth Environmental Observatory"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  })
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("reset_token_idx").on(table.token),
  })
);

// --- Projects & Memberships ---
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").default(""),
    icon: text("icon").default("compass").notNull(),
    status: text("status").default("active").notNull(), // active, completed, on_hold, archived
    targetDate: text("target_date"),
    accent: text("accent").default("terracotta").notNull(), // terracotta, olive, sand, charcoal
    biome: text("biome").default("Savanna").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index("projects_owner_id_idx").on(table.ownerId),
    slugIdx: index("projects_slug_idx").on(table.slug),
  })
);

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("editor").notNull(), // owner, editor, viewer
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
    projectIdx: index("members_project_id_idx").on(table.projectId),
    userIdx: index("members_user_id_idx").on(table.userId),
  })
);

// --- Task Columns (Kanban) ---
export const taskColumns = pgTable(
  "task_columns",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("columns_project_id_idx").on(table.projectId),
  })
);

// --- Tasks ---
export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    columnId: text("column_id")
      .notNull()
      .references(() => taskColumns.id, { onDelete: "cascade" }),
    order: integer("order").default(0).notNull(),
    title: text("title").notNull(),
    description: text("description").default(""),
    type: text("type").default("research").notNull(), // feature, bug, enhancement, research, chore
    status: text("status").default("todo").notNull(), // todo, in_progress, completed
    priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
    dueDate: text("due_date"),
    assigneeName: text("assignee_name").default("Current User"),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    checklists: jsonb("checklists").default([]).notNull(), // Array of { id, title, completed }
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("tasks_project_id_idx").on(table.projectId),
    columnIdx: index("tasks_column_id_idx").on(table.columnId),
    statusIdx: index("tasks_status_idx").on(table.status),
    priorityIdx: index("tasks_priority_idx").on(table.priority),
  })
);

// --- Task Labels ---
export const taskLabels = pgTable(
  "task_labels",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.label] }),
    taskIdx: index("task_labels_task_id_idx").on(table.taskId),
  })
);

// --- Research Notes ---
export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").default("").notNull(),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("notes_project_id_idx").on(table.projectId),
  })
);

export const noteTags = pgTable(
  "note_tags",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.noteId, table.tag] }),
    noteIdx: index("note_tags_note_id_idx").on(table.noteId),
  })
);

// --- Architecture Diagrams ---
export const diagrams = pgTable(
  "diagrams",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").default(""),
    type: text("type").default("architecture").notNull(),
    nodeCount: integer("node_count").default(0).notNull(),
    edgeCount: integer("edge_count").default(0).notNull(),
    canvasData: jsonb("canvas_data").default({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } }).notNull(),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("diagrams_project_id_idx").on(table.projectId),
  })
);

// --- Cross-Module Relationships ---
// Connects tasks, notes, and diagrams bidirectionally within the same project
export const itemRelationships = pgTable(
  "item_relationships",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(), // task, note, diagram
    sourceId: text("source_id").notNull(),
    targetType: text("target_type").notNull(), // task, note, diagram
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("rel_source_idx").on(table.sourceType, table.sourceId),
    targetIdx: index("rel_target_idx").on(table.targetType, table.targetId),
    projectIdx: index("rel_project_id_idx").on(table.projectId),
    uniqueRelIdx: uniqueIndex("unique_rel_idx").on(
      table.sourceType,
      table.sourceId,
      table.targetType,
      table.targetId
    ),
  })
);

// --- Activity Events Audit Log ---
export const activityEvents = pgTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    userName: text("user_name").default("Current User").notNull(),
    action: text("action").notNull(),
    target: text("target").notNull(),
    iconType: text("icon_type").default("project").notNull(), // project, task, note, diagram, link
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("activity_project_id_idx").on(table.projectId),
    userIdx: index("activity_user_id_idx").on(table.userId),
    createdAtIdx: index("activity_created_at_idx").on(table.createdAt),
  })
);

// --- Drizzle Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  memberships: many(projectMembers),
  sessions: many(sessions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  members: many(projectMembers),
  columns: many(taskColumns),
  tasks: many(tasks),
  notes: many(notes),
  diagrams: many(diagrams),
  relationships: many(itemRelationships),
  activities: many(activityEvents),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  column: one(taskColumns, { fields: [tasks.columnId], references: [taskColumns.id] }),
  labels: many(taskLabels),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  project: one(projects, { fields: [notes.projectId], references: [projects.id] }),
  tags: many(noteTags),
}));

export const diagramsRelations = relations(diagrams, ({ one }) => ({
  project: one(projects, { fields: [diagrams.projectId], references: [projects.id] }),
}));
