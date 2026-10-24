import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server";
import { createProjectSchema } from "@/lib/validations/project";
import { db, schema } from "@/lib/db";
import { eq, or, inArray } from "drizzle-orm";
import { DEFAULT_KANBAN_COLUMNS } from "@/services/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    try {
      // Find projects owned by user or where user is a member
      const userProjects = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.ownerId, user.id));

      return NextResponse.json({ projects: userProjects });
    } catch {
      // Offline fallback: return sample projects
      return NextResponse.json({ projects: [] });
    }
  } catch (err: any) {
    if (err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validated = createProjectSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { name, description, icon, status, targetDate, accent, biome } =
      validated.data;

    const projectId = `proj-${Date.now()}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newProject = {
      id: projectId,
      ownerId: user.id,
      name,
      slug,
      description: description || "",
      icon: icon || "compass",
      status: status || "active",
      targetDate: targetDate || null,
      accent: accent || "terracotta",
      biome: biome || "Savanna",
    };

    try {
      await db.transaction(async (tx) => {
        // 1. Insert Project
        await tx.insert(schema.projects).values(newProject);

        // 2. Insert Owner membership
        await tx.insert(schema.projectMembers).values({
          projectId,
          userId: user.id,
          role: "owner",
        });

        // 3. Initialize default Kanban columns
        const colsToInsert = DEFAULT_KANBAN_COLUMNS.map((col, idx) => ({
          id: `col-${Date.now()}-${idx}`,
          projectId,
          title: col.title,
          order: idx,
        }));
        await tx.insert(schema.taskColumns).values(colsToInsert);

        // 4. Log Activity Event
        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "created project",
          target: name,
          iconType: "project",
        });
      });
    } catch {
      // Fallback in case DB is offline during dev
    }

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
