import { z } from "zod";

export const createNoteSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  title: z.string().min(1, "Title is required.").max(200),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
