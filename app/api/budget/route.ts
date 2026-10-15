import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../../lib/auth";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// Saves the user's overall monthly budget. The page sends it in pounds.
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail("Not logged in", 401);

  const body = (await request.json().catch(() => null)) as {
    adjusted_budget?: unknown;
  } | null;

  const amount = Number(body?.adjusted_budget);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    return fail("Please enter a valid budget", 400);
  }

  try {
    const { env } = getCloudflareContext();
    const result = await env.Ekonos.prepare(
      "UPDATE users SET budget_pence = ? WHERE public_id = ?",
    )
      .bind(Math.round(amount * 100), userId)
      .run();

    if (!result.meta.changes) return fail("Account not found", 404);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
