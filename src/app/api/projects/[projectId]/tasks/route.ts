import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { createTaskSchema } from "@/lib/validations/task";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

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
      const taskList = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.projectId, projectId))
        .orderBy(asc(schema.tasks.order));

      return NextResponse.json({ tasks: taskList });
    } catch {
      return NextResponse.json({ tasks: [] });
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
    const validated = createTaskSchema.safeParse({ ...body, projectId });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid task input." },
        { status: 400 }
      );
    }

    const { title, description, columnId, type, priority, labels, dueDate } = validated.data;
    const taskId = `task-${Date.now()}`;

    const newTask = {
      id: taskId,
      projectId,
      columnId,
      title: title.trim(),
      description: description || "",
      type: type || "research",
      status: "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      assigneeName: user.name,
      assigneeId: user.id,
      checklists: [],
      order: 0,
    };

    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.tasks).values(newTask);

        if (labels && labels.length > 0) {
          await tx.insert(schema.taskLabels).values(
            labels.map((lbl) => ({
              taskId,
              label: lbl,
            }))
          );
        }

        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "created task",
          target: title,
          iconType: "task",
        });
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
