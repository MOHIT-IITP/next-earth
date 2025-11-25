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
            error: "Server Error hai bhai",
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
            take: 4,
        });
        return NextResponse.json({projects: latestProject});
    } catch (error) {
        console.log("Latest Project Error", error);
        return NextResponse.json({error: "Server error "}, {status: 500})
    }
}

