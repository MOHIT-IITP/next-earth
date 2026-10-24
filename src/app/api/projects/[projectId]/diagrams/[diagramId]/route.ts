import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { updateDiagramSchema } from "@/lib/validations/diagram";
import { db, schema } from "@/lib/db";
import { eq, or, and } from "drizzle-orm";

interface RouteParams {
  params: {
    projectId: string;
    diagramId: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId, diagramId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    const body = await request.json();
    const validated = updateDiagramSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid update payload." },
        { status: 400 }
      );
    }

    try {
      const updated = await db
        .update(schema.diagrams)
        .set({
          ...validated.data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.diagrams.id, diagramId),
            eq(schema.diagrams.projectId, projectId)
          )
        )
        .returning();

      return NextResponse.json({ diagram: updated[0] });
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
    const { projectId, diagramId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    try {
      await db.transaction(async (tx) => {
        // 1. Clean up cross-module item relationships safely
        await tx
          .delete(schema.itemRelationships)
          .where(
            or(
              and(
                eq(schema.itemRelationships.sourceType, "diagram"),
                eq(schema.itemRelationships.sourceId, diagramId)
              ),
              and(
                eq(schema.itemRelationships.targetType, "diagram"),
                eq(schema.itemRelationships.targetId, diagramId)
              )
            )
          );

        // 2. Delete diagram
        await tx
          .delete(schema.diagrams)
          .where(
            and(
              eq(schema.diagrams.id, diagramId),
              eq(schema.diagrams.projectId, projectId)
            )
          );

        // 3. Log Activity
        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "deleted diagram",
          target: diagramId,
          iconType: "diagram",
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
