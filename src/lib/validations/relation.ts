import { z } from "zod";

export const linkItemsSchema = z.object({
  sourceType: z.enum(["task", "note", "diagram"]),
  sourceId: z.string().min(1),
  targetType: z.enum(["task", "note", "diagram"]),
  targetId: z.string().min(1),
});

export const unlinkItemsSchema = linkItemsSchema;

export type LinkItemsInput = z.infer<typeof linkItemsSchema>;
