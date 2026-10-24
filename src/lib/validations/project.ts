import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters.").max(100),
  description: z.string().max(1000).default(""),
  icon: z.string().default("compass"),
  status: z.enum(["active", "completed", "on_hold", "archived"]).default("active"),
  targetDate: z.string().optional(),
  accent: z.enum(["terracotta", "olive", "sand", "charcoal"]).default("terracotta"),
  biome: z.string().min(2).default("Savanna"),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
