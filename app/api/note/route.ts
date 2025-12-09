import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, projectId } = await req.json();
    console.log(req.json);
    if (!title || !content) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (projectId) {
      if (typeof projectId !== "string") {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
      }
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 400 });
      }
      // ensure the user has access to the project (adjust field name if your schema differs)
      if (project.userId !== userId) {
      return NextResponse.json({ error: "You don't have permission to add notes to this project." }, { status: 403 });
      }
    }

    const note = await prisma.note.create({
      data: {
      title,
      content,
      projectId: projectId ,
      },
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


    
    