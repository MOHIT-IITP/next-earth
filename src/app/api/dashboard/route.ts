import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, inArray, or } from "drizzle-orm";
import { requireAuth, UnauthorizedError } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    // 1. Get all projects where user is owner or member
    const memberships = await db
      .select({ projectId: schema.projectMembers.projectId })
      .from(schema.projectMembers)
      .where(eq(schema.projectMembers.userId, user.id));

    const memberProjectIds = memberships.map((m) => m.projectId);

    // Query projects owned or where member
    const userProjects = await db
      .select()
      .from(schema.projects)
      .where(
        memberProjectIds.length > 0
          ? or(
              eq(schema.projects.ownerId, user.id),
              inArray(schema.projects.id, memberProjectIds)
            )
          : eq(schema.projects.ownerId, user.id)
      )
      .orderBy(desc(schema.projects.updatedAt));

    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json(
        {
          metrics: {
            totalProjects: 0,
            activeProjects: 0,
            archivedProjects: 0,
            completedProjects: 0,
            totalTasks: 0,
            openTasks: 0,
            overdueTasks: 0,
            completedTasks: 0,
            completionRate: 0,
          },
          recentProjects: [],
          recentTasks: [],
          recentNotes: [],
          recentDiagrams: [],
          recentActivities: [],
        },
        { status: 200 }
      );
    }

    // 2. Fetch tasks, notes, diagrams, and activities across user's projects
    const [allTasks, recentNotes, recentDiagrams, recentActivities] = await Promise.all([
      db
        .select()
        .from(schema.tasks)
        .where(inArray(schema.tasks.projectId, projectIds)),
      db
        .select()
        .from(schema.notes)
        .where(inArray(schema.notes.projectId, projectIds))
        .orderBy(desc(schema.notes.updatedAt))
        .limit(5),
      db
        .select()
        .from(schema.diagrams)
        .where(inArray(schema.diagrams.projectId, projectIds))
        .orderBy(desc(schema.diagrams.updatedAt))
        .limit(5),
      db
        .select()
        .from(schema.activityEvents)
        .where(inArray(schema.activityEvents.projectId, projectIds))
        .orderBy(desc(schema.activityEvents.createdAt))
        .limit(10),
    ]);

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter((p) => p.status === "active").length;
    const archivedProjects = userProjects.filter((p) => p.status === "archived").length;
    const completedProjects = userProjects.filter((p) => p.status === "completed").length;

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const openTasks = allTasks.filter((t) => t.status !== "completed").length;

    const now = new Date();
    const overdueTasks = allTasks.filter((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recentProjects = userProjects.slice(0, 4);
    const recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return NextResponse.json(
      {
        metrics: {
          totalProjects,
          activeProjects,
          archivedProjects,
          completedProjects,
          totalTasks,
          openTasks,
          overdueTasks,
          completedTasks,
          completionRate,
        },
        recentProjects,
        recentTasks,
        recentNotes,
        recentDiagrams,
        recentActivities,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data." }, { status: 500 });
  }
}
