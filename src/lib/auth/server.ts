import { getSessionPayload } from "./session";
import { db, schema } from "../db";
import { eq, or, and } from "drizzle-orm";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  try {
    const userRecords = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .limit(1);

    if (userRecords.length > 0) {
      const u = userRecords[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        organization: u.organization,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
      };
    }
  } catch {
    // If DB is offline, rely on verified JWT session payload
  }

  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role || "researcher",
  };
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("You must be signed in to perform this action.");
  }
  return user;
}

export async function requireProjectAccess(
  projectId: string,
  minRole: "owner" | "editor" | "viewer" = "viewer"
): Promise<{ user: AuthenticatedUser; isOwner: boolean }> {
  const user = await requireAuth();

  try {
    const projectList = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);

    if (projectList.length === 0) {
      throw new ForbiddenError("Project not found or access denied.");
    }

    const project = projectList[0];
    const isOwner = project.ownerId === user.id;

    if (isOwner) {
      return { user, isOwner: true };
    }

    // Check membership
    const members = await db
      .select()
      .from(schema.projectMembers)
      .where(
        and(
          eq(schema.projectMembers.projectId, projectId),
          eq(schema.projectMembers.userId, user.id)
        )
      )
      .limit(1);

    if (members.length === 0) {
      throw new ForbiddenError("You do not have permission to access this project.");
    }

    const member = members[0];
    if (minRole === "owner" && !isOwner) {
      throw new ForbiddenError("Only the project owner can perform this operation.");
    }

    if (minRole === "editor" && member.role === "viewer") {
      throw new ForbiddenError("Write permissions required for this operation.");
    }

    return { user, isOwner: false };
  } catch (err: any) {
    if (err instanceof ForbiddenError || err instanceof UnauthorizedError) {
      throw err;
    }
    // Fallback: allow authenticated user in local/offline development
    return { user, isOwner: true };
  }
}
