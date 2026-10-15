import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SESSION_COOKIE, signToken } from "../../lib/auth";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) return fail("Missing fields", 400);
  if (name.length > 100) return fail("Name is too long", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return fail("Please enter a valid email", 400);
  }
  // bcrypt only uses the first 72 bytes of a password.
  if (password.length < 8 || password.length > 72) {
    return fail("Password must be between 8 and 72 characters", 400);
  }

  try {
    const { env } = getCloudflareContext();
    const passwordHash = await bcrypt.hash(password, 10);
    const publicId = crypto.randomUUID();

    try {
      await env.Ekonos.prepare(
        "INSERT INTO users (public_id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      )
        .bind(publicId, name, email, passwordHash)
        .run();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("UNIQUE")) return fail("Email taken", 409);
      console.error("Signup insert failed:", message);
      return fail("Database error", 500);
    }

    const token = await signToken(publicId, email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
    return response;
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
