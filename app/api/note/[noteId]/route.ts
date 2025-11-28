import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: "Nothing to update. Provide title or content." },
        { status: 400 }
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to update note",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

