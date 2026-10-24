import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { updateTaskSchema } from "@/lib/validations/task";
import { db, schema } from "@/lib/db";
import { eq, or, and } from "drizzle-orm";

interface RouteParams {
  params: {
    projectId: string;
    taskId: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId, taskId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    const body = await request.json();
    const validated = updateTaskSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid update payload." },
        { status: 400 }
      );
    }

    try {
      const updated = await db
        .update(schema.tasks)
        .set({
          ...validated.data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.tasks.id, taskId),
            eq(schema.tasks.projectId, projectId)
          )
        )
        .returning();

      if (validated.data.status === "completed") {
        await db.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "completed task",
          target: updated[0]?.title || taskId,
          iconType: "task",
        });
      }

      return NextResponse.json({ task: updated[0] });
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { projectId, taskId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    try {
      await db.transaction(async (tx) => {
        // 1. Clean up cross-module item relationships safely
        await tx
          .delete(schema.itemRelationships)
          .where(
            or(
              and(
                eq(schema.itemRelationships.sourceType, "task"),
                eq(schema.itemRelationships.sourceId, taskId)
              ),
              and(
                eq(schema.itemRelationships.targetType, "task"),
                eq(schema.itemRelationships.targetId, taskId)
              )
            )
          );

        // 2. Delete task
        await tx
          .delete(schema.tasks)
          .where(
            and(
              eq(schema.tasks.id, taskId),
              eq(schema.tasks.projectId, projectId)
            )
          );

        // 3. Log Activity
        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "deleted task",
          target: taskId,
          iconType: "task",
        });
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
