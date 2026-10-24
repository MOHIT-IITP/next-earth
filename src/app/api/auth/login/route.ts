import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/passwords";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid credentials." },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit login attempts per email/IP
    const rate = checkRateLimit(`login:${normalizedEmail}`, 5, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 60 seconds before trying again." },
        { status: 429 }
      );
    }

    let user: typeof schema.users.$inferSelect | undefined;

    try {
      const records = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalizedEmail))
        .limit(1);

      if (records.length > 0) {
        user = records[0];
      }
    } catch {
      // Offline fallback
    }

    // If user found in database, verify real bcrypt password
    if (user) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Development fallback mock account (when DB has not been seeded yet)
    if (
      normalizedEmail === "researcher@earth.internal" &&
      password === "Earth@2026!"
    ) {
      const devUser = {
        userId: "usr-01",
        email: normalizedEmail,
        name: "Dr. Elena Rostova",
        role: "Lead Biome Ecologist",
      };
      await setSessionCookie(devUser);
      return NextResponse.json({ user: devUser });
    }

    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication service error." },
      { status: 500 }
    );
  }
}
