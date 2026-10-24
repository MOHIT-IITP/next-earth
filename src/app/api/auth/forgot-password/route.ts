import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid email address." },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const rate = checkRateLimit(`reset:${normalizedEmail}`, 3, 120);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many password recovery attempts. Please wait 2 minutes." },
        { status: 429 }
      );
    }

    try {
      const records = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalizedEmail))
        .limit(1);

      if (records.length > 0) {
        const user = records[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.insert(schema.passwordResetTokens).values({
          id: `rst-${Date.now()}`,
          userId: user.id,
          token,
          expiresAt,
        });
      }
    } catch {
      // Don't leak errors to client
    }

    // Always return safe generic confirmation to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an observatory account exists with this email, recovery instructions have been dispatched.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to process recovery request at this time." },
      { status: 500 }
    );
  }
}
