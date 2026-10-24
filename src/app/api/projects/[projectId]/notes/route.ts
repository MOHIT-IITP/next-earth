import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/lib/auth/server";
import { createNoteSchema } from "@/lib/validations/note";
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
      const noteList = await db
        .select()
        .from(schema.notes)
        .where(eq(schema.notes.projectId, projectId))
        .orderBy(desc(schema.notes.updatedAt));

      return NextResponse.json({ notes: noteList });
    } catch {
      return NextResponse.json({ notes: [] });
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
    const validated = createNoteSchema.safeParse({ ...body, projectId });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid note input." },
        { status: 400 }
      );
    }

    const { title, content, tags } = validated.data;
    const noteId = `note-${Date.now()}`;

    const newNote = {
      id: noteId,
      projectId,
      title: title.trim(),
      content: content || "",
      authorId: user.id,
    };

    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.notes).values(newNote);

        if (tags && tags.length > 0) {
          await tx.insert(schema.noteTags).values(
            tags.map((tag) => ({
              noteId,
              tag,
            }))
          );
        }

        await tx.insert(schema.activityEvents).values({
          id: `act-${Date.now()}`,
          projectId,
          userId: user.id,
          userName: user.name,
          action: "created note",
          target: title,
          iconType: "note",
        });
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (err: any) {
    if (err.name === "UnauthorizedError") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.name === "ForbiddenError") return NextResponse.json({ error: err.message }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
