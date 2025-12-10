import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if(!session || !session.user?.id){
            console.error("[TODO API] Unauthorized: session=", session);
            return NextResponse.json({error: "Unauthorized" }, {status: 401});
        }

        const body = await req.json();
        const {title, description, status, priority, projectId} = body;
        console.log("[TODO API] Incoming data:", { title, description, status, priority, projectId, userId });
        if(!title || !description || !status || !priority){
            console.error("[TODO API] Missing fields", { title, description, status, priority });
            return NextResponse.json({error: "All fields are required."}, {status:400});
        }

        if (projectId) {
            if (typeof projectId !== "string") {
                console.error("[TODO API] Invalid projectId", projectId);
                return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
            }
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) {
                console.error("[TODO API] Project not found", projectId);
                return NextResponse.json({ error: "Project not found." }, { status: 400 });
            }
            if (project.userId !== userId) {
                console.error("[TODO API] User does not own project", { projectUserId: project.userId, userId });
                return NextResponse.json({ error: "You don't have permission to add notes to this project." }, { status: 403 });
            }
        }
        try {
            const todo = await prisma.todo.create({
                data: {
                    title,
                    description,
                    status,
                    priority,
                    projectId: projectId,
                },
            });
            return NextResponse.json({todo}, {status: 201});
        } catch (prismaError) {
            console.error("[TODO API] Prisma error:", prismaError);
            return NextResponse.json({error: "Prisma error: ", prismaError  }, {status:500});
        }
    } catch (error) {
        console.error("[TODO API] Server error:", error);
        return NextResponse.json({error: "Server error in creating todo: " + (error)}, {status:500});
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }
        // Get projectId from query string
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        if (!projectId) {
            return NextResponse.json({ error: "projectId is required" }, { status: 400 });
        }
        const todo = await prisma.todo.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ todo });
    } catch (error) {
        console.log("Error in fetching all the todo", error);
        return NextResponse.json({ error: "Error in getting latest todo" }, { status: 500 });
    }
}

