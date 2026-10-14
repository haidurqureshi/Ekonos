import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../../lib/auth";
import { ethicsStatement } from "../../lib/transactions";
import { CATEGORIES } from "../../lib/transaction-types";

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail("Not logged in", 401);

  const body = (await request.json().catch(() => null)) as {
    brand?: unknown;
    price?: unknown;
    category?: unknown;
    ethical_score?: unknown;
  } | null;
  if (!body) return fail("Invalid request", 400);

  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const price = Number(body.price);
  const score = Number(body.ethical_score);
  const category = body.category;

  if (!brand || brand.length > 100) return fail("Please enter a brand", 400);
  if (!Number.isFinite(price) || price < 0) {
    return fail("Please enter a valid price", 400);
  }
  if (
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category)
  ) {
    return fail("Please choose a category", 400);
  }
  // A score of 0 is valid, so check the range rather than "is it falsy".
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return fail("Ethical score must be between 0 and 100", 400);
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.Ekonos;

    // Insert the transaction and recalculate the user's ethical scores in one
    // batch, so the stored scores can never fall out of step with the data.
    await db.batch([
      db
        .prepare(
          `INSERT INTO transactions (user_id, company_name, amount_pence, category, ethical_score)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(userId, brand, Math.round(price * 100), category, score),
      ethicsStatement(db, userId),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
