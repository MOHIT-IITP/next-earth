import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  columnId: z.string().min(1, "Column ID is required."),
  title: z.string().min(1, "Task title is required.").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["feature", "bug", "enhancement", "research", "chore"]).default("research"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  labels: z.array(z.string()).default([]),
  dueDate: z.string().optional(),
  order: z.number().int().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  columnId: z.string().optional(),
  type: z.enum(["feature", "bug", "enhancement", "research", "chore"]).optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional().nullable(),
  order: z.number().int().optional(),
  checklists: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    })
  ).optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().min(1, "Column ID is required."),
  order: z.number().int().min(0).default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
