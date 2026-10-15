import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../../lib/auth";
import { CATEGORIES } from "../../lib/transaction-types";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// Saves all of a user's category limits in one go.
// A blank, null or 0 value means "no limit" and removes that category's limit.
export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail("Not logged in", 401);

  const body = (await request.json().catch(() => null)) as {
    budgets?: Record<string, unknown>;
  } | null;
  if (!body || typeof body.budgets !== "object" || body.budgets === null) {
    return fail("Invalid request", 400);
  }

  const { env } = getCloudflareContext();
  const db = env.Ekonos;
  const statements: ReturnType<typeof db.prepare>[] = [];

  for (const category of CATEGORIES) {
    const raw = body.budgets[category];

    // Not provided, blank or null: clear any existing limit.
    if (raw === undefined || raw === null || raw === "") {
      statements.push(
        db
          .prepare(
            "DELETE FROM category_budgets WHERE user_id = ? AND category = ?",
          )
          .bind(userId, category),
      );
      continue;
    }

    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
      return fail(`Please enter a valid amount for ${category}`, 400);
    }

    const pence = Math.round(amount * 100);

    if (pence === 0) {
      statements.push(
        db
          .prepare(
            "DELETE FROM category_budgets WHERE user_id = ? AND category = ?",
          )
          .bind(userId, category),
      );
    } else {
      statements.push(
        db
          .prepare(
            `INSERT INTO category_budgets (user_id, category, amount_pence)
             VALUES (?, ?, ?)
             ON CONFLICT (user_id, category)
             DO UPDATE SET amount_pence = excluded.amount_pence`,
          )
          .bind(userId, category, pence),
      );
    }
  }

  try {
    await db.batch(statements);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
