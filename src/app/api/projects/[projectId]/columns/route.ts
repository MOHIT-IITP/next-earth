import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, asc, count } from "drizzle-orm";
import { requireProjectAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth/server";
import { createColumnSchema, reorderColumnsSchema } from "@/lib/validations/column";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await requireProjectAccess(params.projectId, "viewer");

    const columns = await db
      .select()
      .from(schema.taskColumns)
      .where(eq(schema.taskColumns.projectId, params.projectId))
      .orderBy(asc(schema.taskColumns.order));

    return NextResponse.json({ columns }, { status: 200 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Columns GET error:", error);
    return NextResponse.json({ error: "Failed to fetch columns." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { user } = await requireProjectAccess(params.projectId, "editor");
    const body = await request.json();
    const validated = createColumnSchema.parse(body);

    // Get current count to determine next order
    const existingColumns = await db
      .select({ id: schema.taskColumns.id })
      .from(schema.taskColumns)
      .where(eq(schema.taskColumns.projectId, params.projectId));

    const nextOrder = validated.order !== undefined ? validated.order : existingColumns.length;
    const columnId = `col-${crypto.randomUUID()}`;

    const [created] = await db
      .insert(schema.taskColumns)
      .values({
        id: columnId,
        projectId: params.projectId,
        title: validated.title,
        order: nextOrder,
      })
      .returning();

    // Log activity
    await db.insert(schema.activityEvents).values({
      id: `act-${crypto.randomUUID()}`,
      projectId: params.projectId,
      userId: user.id,
      userName: user.name,
      action: "created column",
      target: validated.title,
      iconType: "project",
    });

    return NextResponse.json({ column: created }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid input." }, { status: 400 });
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Column POST error:", error);
    return NextResponse.json({ error: "Failed to create column." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await requireProjectAccess(params.projectId, "editor");
    const body = await request.json();
    const validated = reorderColumnsSchema.parse(body);

    // Update order for each column in transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < validated.columnIds.length; i++) {
        await tx
          .update(schema.taskColumns)
          .set({ order: i })
          .where(eq(schema.taskColumns.id, validated.columnIds[i]));
      }
    });

    const updated = await db
      .select()
      .from(schema.taskColumns)
      .where(eq(schema.taskColumns.projectId, params.projectId))
      .orderBy(asc(schema.taskColumns.order));

    return NextResponse.json({ columns: updated }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid input." }, { status: 400 });
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Columns PATCH error:", error);
    return NextResponse.json({ error: "Failed to reorder columns." }, { status: 500 });
  }
}
