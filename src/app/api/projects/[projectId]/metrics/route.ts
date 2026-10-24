import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireProjectAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await requireProjectAccess(params.projectId, "viewer");

    const [tasks, notes, diagrams, relationships] = await Promise.all([
      db.select().from(schema.tasks).where(eq(schema.tasks.projectId, params.projectId)),
      db.select({ id: schema.notes.id }).from(schema.notes).where(eq(schema.notes.projectId, params.projectId)),
      db.select({ id: schema.diagrams.id }).from(schema.diagrams).where(eq(schema.diagrams.projectId, params.projectId)),
      db.select().from(schema.itemRelationships).where(eq(schema.itemRelationships.projectId, params.projectId)),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;

    const now = new Date();
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
      urgent: tasks.filter((t) => t.priority === "urgent").length,
    };

    const upcomingTasks = tasks
      .filter((t) => t.dueDate && t.status !== "completed")
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    // Connected task IDs from relationships
    const connectedTaskIds = new Set(
      relationships
        .filter((r) => r.sourceType === "task")
        .map((r) => r.sourceId)
    );
    const connectedTasks = tasks.filter((t) => connectedTaskIds.has(t.id));

    return NextResponse.json({
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        openTasks: todoTasks + inProgressTasks,
        overdueTasks,
        completionRate,
        byPriority,
        totalNotes: notes.length,
        totalDiagrams: diagrams.length,
        upcomingTasks,
        connectedTasks,
      },
    }, { status: 200 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Project metrics GET error:", error);
    return NextResponse.json({ error: "Failed to compute project metrics." }, { status: 500 });
  }
}
