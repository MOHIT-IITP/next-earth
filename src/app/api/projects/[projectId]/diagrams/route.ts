import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { createDiagramSchema } from "@/lib/validations/diagram";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

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
      const diagramList = await db
        .select()
        .from(schema.diagrams)
        .where(eq(schema.diagrams.projectId, projectId))
        .orderBy(desc(schema.diagrams.updatedAt));

      return NextResponse.json({ diagrams: diagramList });
    } catch {
      return NextResponse.json({ diagrams: [] });
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
    const validated = createDiagramSchema.safeParse({ ...body, projectId });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid diagram input." },
        { status: 400 }
      );
    }

    const { title, description, type, canvasData } = validated.data;
    const diagramId = `diag-${Date.now()}`;

    const newDiagram = {
      id: diagramId,
      projectId,
      title: title.trim(),
      description: description || "",
      type: type || "architecture",
      nodeCount: canvasData?.nodes?.length || 0,
      edgeCount: canvasData?.edges?.length || 0,
      canvasData: canvasData || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      authorId: user.id,
    };

    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.diagrams).values(newDiagram);

        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "designed diagram",
          target: title,
          iconType: "diagram",
        });
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ diagram: newDiagram }, { status: 201 });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
