import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and, asc } from "drizzle-orm";
import { requireProjectAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth/server";
import { updateColumnSchema, deleteColumnSchema } from "@/lib/validations/column";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; columnId: string } }
) {
  try {
    const { user } = await requireProjectAccess(params.projectId, "editor");
    const body = await request.json();
    const validated = updateColumnSchema.parse(body);

    const [updated] = await db
      .update(schema.taskColumns)
      .set({ title: validated.title })
      .where(
        and(
          eq(schema.taskColumns.id, params.columnId),
          eq(schema.taskColumns.projectId, params.projectId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Column not found." }, { status: 404 });
    }

    return NextResponse.json({ column: updated }, { status: 200 });
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
    console.error("Column PATCH error:", error);
    return NextResponse.json({ error: "Failed to update column." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; columnId: string } }
) {
  try {
    await requireProjectAccess(params.projectId, "editor");

    // Optional query param or body with migrateToColumnId
    let migrateToColumnId: string | undefined;
    try {
      const url = new URL(request.url);
      const migrateParam = url.searchParams.get("migrateTo");
      if (migrateParam) migrateToColumnId = migrateParam;
      else {
        const body = await request.json().catch(() => ({}));
        if (body.migrateToColumnId) migrateToColumnId = body.migrateToColumnId;
      }
    } catch {
      // Body might be empty
    }

    // Check if tasks exist in this column
    const tasksInCol = await db
      .select({ id: schema.tasks.id })
      .from(schema.tasks)
      .where(
        and(
          eq(schema.tasks.projectId, params.projectId),
          eq(schema.tasks.columnId, params.columnId)
        )
      );

    if (tasksInCol.length > 0 && !migrateToColumnId) {
      return NextResponse.json(
        {
          error: `Column contains ${tasksInCol.length} task(s). Please specify a target column to migrate them before deleting.`,
        },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      // Migrate tasks if requested
      if (tasksInCol.length > 0 && migrateToColumnId) {
        await tx
          .update(schema.tasks)
          .set({
            columnId: migrateToColumnId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schema.tasks.projectId, params.projectId),
              eq(schema.tasks.columnId, params.columnId)
            )
          );
      }

      // Delete the column
      await tx
        .delete(schema.taskColumns)
        .where(
          and(
            eq(schema.taskColumns.id, params.columnId),
            eq(schema.taskColumns.projectId, params.projectId)
          )
        );

      // Reorder remaining columns
      const remaining = await tx
        .select()
        .from(schema.taskColumns)
        .where(eq(schema.taskColumns.projectId, params.projectId))
        .orderBy(asc(schema.taskColumns.order));

      for (let i = 0; i < remaining.length; i++) {
        await tx
          .update(schema.taskColumns)
          .set({ order: i })
          .where(eq(schema.taskColumns.id, remaining[i].id));
      }
    });

    return NextResponse.json({ success: true, message: "Column deleted successfully." }, { status: 200 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Column DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete column." }, { status: 500 });
  }
}
