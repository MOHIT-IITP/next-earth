import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireProjectAccess, UnauthorizedError, ForbiddenError } from "@/lib/auth/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await requireProjectAccess(params.projectId, "viewer");

    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    const activities = await db
      .select()
      .from(schema.activityEvents)
      .where(eq(schema.activityEvents.projectId, params.projectId))
      .orderBy(desc(schema.activityEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Activity GET error:", error);
    return NextResponse.json({ error: "Failed to fetch activity events." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { user } = await requireProjectAccess(params.projectId, "editor");
    const body = await request.json();

    if (!body.action || !body.target) {
      return NextResponse.json({ error: "Action and target are required." }, { status: 400 });
    }

    const activityId = `act-${crypto.randomUUID()}`;
    const [created] = await db
      .insert(schema.activityEvents)
      .values({
        id: activityId,
        projectId: params.projectId,
        userId: user.id,
        userName: body.userName || user.name,
        action: body.action,
        target: body.target,
        iconType: body.iconType || "project",
        details: body.details || null,
      })
      .returning();

    return NextResponse.json({ activity: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Activity POST error:", error);
    return NextResponse.json({ error: "Failed to record activity." }, { status: 500 });
  }
}
