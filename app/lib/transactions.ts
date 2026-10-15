// Server-only helpers. Client components should import from ./transaction-types instead.
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Columns used when reading transactions. If your table uses different
// column names, change them here and in the UPDATE in
// app/api/transactions/[id]/route.ts.
export const TX_COLUMNS =
  "rowid AS id, company_name AS brand, amount_pence, category, ethical_score, created_at";

type Db = ReturnType<typeof getCloudflareContext>["env"]["Ekonos"];

// Rebuilds the user's overall ethical score (the average of their transaction
// scores). Run it after every add, edit or delete so the dashboard stays correct.
// ethicsStatement() returns the prepared statement so it can run in the same
// db.batch() as the change itself (both succeed or neither does).
// Per-category scores are not stored: the dashboard works them out from the
// transactions. With no transactions the overall score is stored as 100, which
// also keeps this safe if the column is NOT NULL; the dashboard shows "no data
// yet" by counting transactions, not by reading this value.
export function ethicsStatement(db: Db, userId: string) {
  return db
    .prepare(
      `UPDATE users
       SET ethical_score = COALESCE(
         (SELECT AVG(ethical_score) FROM transactions WHERE user_id = ?),
         100
       )
       WHERE public_id = ?`,
    )
    .bind(userId, userId);
}

export async function recalculateEthics(db: Db, userId: string) {
  await ethicsStatement(db, userId).run();
}
