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

export async function PATCH(req:Request, context: {params: Promise<{id: string}>}){
    const {id}  = await context.params;

    if(!id){
        return NextResponse.json(
            {error: "Note ID is required"},
            {status: 400},
        );
    }
    try {
        const formData = await req.json();
        const title = formData.get("title") as string | null;
        const content = formData.get("content") as string | null;

        if(!title || !content) {
            return NextResponse.json(
                {error: "Both title and content are required"},{ status: 400}
            );
        }

        const updateNote = await prisma.note.update({
            where: {id},
            data: {
                title, 
                content,
            },
        });
        return NextResponse.json({
            message: " Note updated successfully",
            updateNote
        });
    } catch (error: any) {
        return NextResponse.json(
            {error: "Failed to update note"}, {status: 500}
        ) ;
    }
}
