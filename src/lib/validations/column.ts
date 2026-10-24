import { z } from "zod";

export const createColumnSchema = z.object({
  title: z.string().trim().min(1, "Column title is required.").max(50),
  order: z.number().int().min(0).optional(),
});

export const updateColumnSchema = z.object({
  title: z.string().trim().min(1, "Column title is required.").max(50),
});

export const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().min(1)).min(1, "At least one column ID is required."),
});

export const deleteColumnSchema = z.object({
  migrateToColumnId: z.string().optional(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
export type DeleteColumnInput = z.infer<typeof deleteColumnSchema>;
