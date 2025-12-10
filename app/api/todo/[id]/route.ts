import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: {params: Promise<{id: string}>}) {
	try {
		const id = await context.params;
		if(!id){
			return NextResponse.json({error:"id is required"},{status: 400})
		}
		const body = await req.json();
		const todo = await prisma.todo.update({
			where: {id: id.id},
			data: {
				title: body.title,
				description: body.description,
				status: body.status,
				priority: body.priority,
			},
		});
		return NextResponse.json({ todo });
	} catch (error) {
		return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
	}
}

// DELETE a todo by id
export async function DELETE(req: Request, context: {params: Promise<{id: string}>}) {
	try {
		const id = await context.params;	
		if(!id){
			return NextResponse.json({error:"id is required"},{status: 400})
		}	
		await prisma.todo.delete({
			where: { id: id.id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
	}
}




