import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single todo by id
export async function GET(req: Request, { params }: { params: { id: string } }) {
	try {
		const todo = await prisma.todo.findUnique({
			where: { id: params.id },
		});
		if (!todo) {
			return NextResponse.json({ error: "Todo not found" }, { status: 404 });
		}
		return NextResponse.json({ todo });
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch todo" }, { status: 500 });
	}
}

// PATCH update a todo by id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
	try {
		const body = await req.json();
		const todo = await prisma.todo.update({
			where: { id: params.id },
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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
	try {
		await prisma.todo.delete({
			where: { id: params.id },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
	}
}




