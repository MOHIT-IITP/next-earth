import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH  (
    req: Request,
    context: {params: Promise<{ id: string }> }
) {
    const {id} = await context.params;

    if(!id){
        return NextResponse.json(
            { error: "Note ID is required" },
            { status: 400 }
        );
    }

    try {
        const {name , description, stack} = await req.json();
        const updated = await prisma.project.update({
            where: {id},
            data: {
                name, 
                description,
                stack,
            },
        });
        return NextResponse.json(updated, {status: 200});

    } catch (error) {
        console.error("Update error", error);
        return NextResponse.json(
            {error: "Failed to update project"},
            {status: 500}
        );
    }
}
