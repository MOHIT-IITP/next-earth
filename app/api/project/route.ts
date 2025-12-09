import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if(!session || !session.user?.id){
            return NextResponse.json({error: "unauthorized"},{ status: 401});
        }

        const userId = session.user.id;

        const {name, stack , description} = await req.json();

        if(!name || !stack){
            return NextResponse.json(
                {error: "All field are required."},
                {status: 400}
            );
        }
        const project = await prisma.project.create({
            data: {
                name, 
                stack,
                description,
                userId,
            },
        });
        
        return NextResponse.json({project}, {status: 201});
    } catch (error) {
        return NextResponse.json({
            error: "Error in creating new Project",
        }, {
            status: 500
        })
    }
}

export async function GET(){
    try {
        const session = await auth();
        if(!session || !session.user?.id){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }
        const latestProject = await prisma.project.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json({projects: latestProject});
    } catch (error) {
        console.log("Latest Project Error", error);
        return NextResponse.json({error: "Server error "}, {status: 500})
    }
}

// function to delete the project
export async function  DELETE  (req:Request){
    try {
        const session = await auth();

        if(!session || !session.user?.id){
            return NextResponse.json({error: "unauthorized"},{ status: 401});
        }

        const {projectId}  =  await req.json();

        const project  = await prisma.project.findUnique({
            where: {id: projectId}
        });
        if(project){
            await prisma.project.delete({
                where: {id: projectId}
            });
        }

        return NextResponse.json({message: "Project deleted successfully"},{status: 400})
        
    } catch (error) {
        console.log("Error in deleting the project", error)
        return NextResponse.json({error: "Server Error"},{status: 500})
    }
}


