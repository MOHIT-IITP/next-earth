import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  try {
    const deletedNote = await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Note deleted successfully",
      deletedNote,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete note", details: err.message },
      { status: 500 }
    );
  }
}

