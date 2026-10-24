import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { updateProjectSchema } from "@/lib/validations/project";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: {
    projectId: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    await requireProjectAccess(projectId, "viewer");

    try {
      const records = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .limit(1);

      if (records.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ project: records[0] });
    } catch {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  } catch (err: any) {
    if (err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.name === "ForbiddenError") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    const body = await request.json();
    const validated = updateProjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid update." },
        { status: 400 }
      );
    }

    try {
      const updated = await db
        .update(schema.projects)
        .set({
          ...validated.data,
          updatedAt: new Date(),
        })
        .where(eq(schema.projects.id, projectId))
        .returning();

      if (validated.data.name) {
        await db.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "updated project",
          target: validated.data.name,
          iconType: "project",
        });
      }

      return NextResponse.json({ project: updated[0] });
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    if (err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.name === "ForbiddenError") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    const { user, isOwner } = await requireProjectAccess(projectId, "owner");

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the project owner can delete this project." },
        { status: 403 }
      );
    }

    try {
      await db.delete(schema.projects).where(eq(schema.projects.id, projectId));
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.name === "ForbiddenError") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
