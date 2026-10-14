import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../../../lib/auth";
import { ethicsStatement } from "../../../lib/transactions";
import { CATEGORIES } from "../../../lib/transaction-types";

type Ctx = { params: Promise<{ id: string }> };

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

async function parseId(ctx: Ctx): Promise<number | null> {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Edit a transaction. Only the owner can change it.
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) return fail("Not logged in", 401);

  const id = await parseId(ctx);
  if (id === null) return fail("Invalid transaction", 400);

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

    // The change and the score recalculation run together as one batch.
    const [result] = await db.batch([
      db
        .prepare(
          `UPDATE transactions
           SET company_name = ?, amount_pence = ?, category = ?, ethical_score = ?
           WHERE rowid = ? AND user_id = ?`,
        )
        .bind(brand, Math.round(price * 100), category, score, id, userId),
      ethicsStatement(db, userId),
    ]);

    if (!result.meta.changes) return fail("Transaction not found", 404);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}

// Delete a transaction. Only the owner can delete it.
export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const userId = await getUserId();
  if (!userId) return fail("Not logged in", 401);

  const id = await parseId(ctx);
  if (id === null) return fail("Invalid transaction", 400);

  try {
    const { env } = getCloudflareContext();
    const db = env.Ekonos;

    const [result] = await db.batch([
      db
        .prepare("DELETE FROM transactions WHERE rowid = ? AND user_id = ?")
        .bind(id, userId),
      ethicsStatement(db, userId),
    ]);

    if (!result.meta.changes) return fail("Transaction not found", 404);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return fail("Server error", 500);
  }
}
