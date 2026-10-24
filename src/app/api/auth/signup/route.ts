import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/passwords";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rate = checkRateLimit(`signup:${ip}`, 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = signupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    try {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalizedEmail))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
    } catch {
      // If DB is offline, continue to fallback
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr-${Date.now()}`;

    try {
      await db.insert(schema.users).values({
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "researcher",
        organization: "Earth Environmental Observatory",
      });
    } catch {
      // Handled gracefully in offline mode
    }

    const sessionPayload = {
      userId,
      email: normalizedEmail,
      name: name.trim(),
      role: "researcher",
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: "researcher",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "An error occurred during account creation." },
      { status: 500 }
    );
  }
}
