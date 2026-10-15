// Server-only helpers. Client components should import from ./transaction-types instead.
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Columns used when reading transactions. If your table uses different
// column names, change them here and in the UPDATE in
// app/api/transactions/[id]/route.ts.
export const TX_COLUMNS =
  "rowid AS id, company_name AS brand, amount_pence, category, ethical_score, created_at";

type Db = ReturnType<typeof getCloudflareContext>["env"]["Ekonos"];

// Rebuilds the user's overall and per-category averages from their transactions.
// Run it after every add, edit or delete so the dashboard stays correct.
// ethicsStatement() returns the prepared statement so it can run in the same
// db.batch() as the change itself (both succeed or neither does).
// Categories with no transactions are stored as 100, which also keeps this safe if
// those columns are NOT NULL. The dashboard decides "no data yet" by counting
// transactions, not by reading these values.
export function ethicsStatement(db: Db, userId: string) {
  return db
    .prepare(
      `UPDATE users
       SET
         ethical_score    = COALESCE((SELECT AVG(ethical_score) FROM transactions WHERE user_id = ?), 100),
         shopping_ethics  = COALESCE((SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Shopping'), 100),
         transport_ethics = COALESCE((SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Transport'), 100),
         other_ethics     = COALESCE((SELECT AVG(ethical_score) FROM transactions WHERE user_id = ? AND category = 'Other'), 100)
       WHERE public_id = ?`,
    )
    .bind(userId, userId, userId, userId, userId);
}

export async function recalculateEthics(db: Db, userId: string) {
  await ethicsStatement(db, userId).run();
}
