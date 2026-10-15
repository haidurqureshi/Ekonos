import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SESSION_COOKIE, signToken } from "../../lib/auth";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) return fail("Missing fields", 400);

  try {
    const { env } = getCloudflareContext();

    const user = await env.Ekonos.prepare(
      "SELECT public_id, email, password_hash FROM users WHERE email = ?",
    )
      .bind(email)
      .first<{ public_id: string; email: string; password_hash: string }>();

    // Same message whether the email or the password is wrong.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return fail("Invalid credentials", 401);
    }

    const token = await signToken(user.public_id, user.email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
    return response;
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
