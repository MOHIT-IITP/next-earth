// in this file i have to fetach only one project based on project id from the path 

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const session = await auth();
        if(!session || !session.user?.id){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }

        const project = await prisma.project.findUnique({
            where: {
                id: params.projectId,
                userId: session.user.id,
            },
        });

        if(!project){
            return NextResponse.json(
                {error: "Project not found."},
                {status: 404}
            );
        }

        return NextResponse.json({project});
    } catch (error) {
        return NextResponse.json({
            error: "Server Error",
        }, {
            status: 500
        })
    }   
}