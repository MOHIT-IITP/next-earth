import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { linkItemsSchema, unlinkItemsSchema } from "@/lib/validations/relation";
import { db, schema } from "@/lib/db";
import { eq, or, and } from "drizzle-orm";

interface RouteParams {
  params: {
    projectId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    await requireProjectAccess(projectId, "viewer");

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Query parameters 'type' and 'id' are required." },
        { status: 400 }
      );
    }

    try {
      // Find all relationships where item is source OR target
      const directRel = await db
        .select()
        .from(schema.itemRelationships)
        .where(
          and(
            eq(schema.itemRelationships.projectId, projectId),
            or(
              and(
                eq(schema.itemRelationships.sourceType, type),
                eq(schema.itemRelationships.sourceId, id)
              ),
              and(
                eq(schema.itemRelationships.targetType, type),
                eq(schema.itemRelationships.targetId, id)
              )
            )
          )
        );

      return NextResponse.json({ relationships: directRel });
    } catch {
      return NextResponse.json({ relationships: [] });
    }
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    const body = await request.json();
    const validated = linkItemsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid link payload." },
        { status: 400 }
      );
    }

    const { sourceType, sourceId, targetType, targetId } = validated.data;

    if (sourceType === targetType && sourceId === targetId) {
      return NextResponse.json(
        { error: "Cannot link an item to itself." },
        { status: 400 }
      );
    }

    try {
      await db.transaction(async (tx) => {
        // Direct link
        await tx
          .insert(schema.itemRelationships)
          .values({
            id: `rel-${Date.now()}-1`,
            projectId,
            sourceType,
            sourceId,
            targetType,
            targetId,
          })
          .onConflictDoNothing();

        // Bidirectional complementary link
        await tx
          .insert(schema.itemRelationships)
          .values({
            id: `rel-${Date.now()}-2`,
            projectId,
            sourceType: targetType,
            sourceId: targetId,
            targetType: sourceType,
            targetId: sourceId,
          })
          .onConflictDoNothing();

        // Log Activity
        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "linked items",
          target: `${sourceType} ↔ ${targetType}`,
          iconType: "link",
        });
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = params;
    const { user } = await requireProjectAccess(projectId, "editor");

    const body = await request.json();
    const validated = unlinkItemsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid unlink payload." },
        { status: 400 }
      );
    }

    const { sourceType, sourceId, targetType, targetId } = validated.data;

    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(schema.itemRelationships)
          .where(
            and(
              eq(schema.itemRelationships.projectId, projectId),
              or(
                and(
                  eq(schema.itemRelationships.sourceType, sourceType),
                  eq(schema.itemRelationships.sourceId, sourceId),
                  eq(schema.itemRelationships.targetType, targetType),
                  eq(schema.itemRelationships.targetId, targetId)
                ),
                and(
                  eq(schema.itemRelationships.sourceType, targetType),
                  eq(schema.itemRelationships.sourceId, targetId),
                  eq(schema.itemRelationships.targetType, sourceType),
                  eq(schema.itemRelationships.targetId, sourceId)
                )
              )
            )
          );

        // Log Activity
        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "unlinked items",
          target: `${sourceType} ↔ ${targetType}`,
          iconType: "link",
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
