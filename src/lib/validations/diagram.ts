import { z } from "zod";

export const createDiagramSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  title: z.string().min(1, "Title is required.").max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["architecture", "flowchart", "ecosystem", "canopy", "soil_profile"]).default("architecture"),
  canvasData: z.any().optional(),
});

export const updateDiagramSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  canvasData: z.any().optional(),
  nodeCount: z.number().int().optional(),
  edgeCount: z.number().int().optional(),
});

export type CreateDiagramInput = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>;
