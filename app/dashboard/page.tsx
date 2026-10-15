import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { TX_COLUMNS } from "../lib/transactions";
import { CATEGORIES, type TransactionItem } from "../lib/transaction-types";

// Account pages should never appear in search results.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

interface UserRow {
  name: string;
  public_id: string;
  budget: number;
  ethical_score: number;
}

interface TransactionRow {
  amount_pence: number;
}

/* ---------- Presentation helpers ---------- */

type Tone = "good" | "warn" | "bad" | "neutral";

// Text colours use darker shades in light mode so they stay readable on white.
const tones: Record<Tone, { text: string; bar: string; border: string }> = {
  good: {
    text: "text-emerald-600 dark:text-[#65e2b9]",
    bar: "bg-emerald-500 dark:bg-[#65e2b9]",
    border: "border-emerald-500 dark:border-[#65e2b9]",
  },
  warn: {
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    border: "border-amber-500",
  },
  bad: {
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    border: "border-red-500",
  },
  // Used when there is no data yet, so nothing looks good or bad.
  neutral: {
    text: "text-zinc-400 dark:text-zinc-500",
    bar: "bg-zinc-300 dark:bg-zinc-700",
    border: "border-zinc-300 dark:border-zinc-700",
  },
};

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const cardClass =
  "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60";

const linkCardClass = `${cardClass} block transition-colors hover:border-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:border-zinc-600 dark:focus-visible:outline-[#65e2b9]`;

function Bar({
  value,
  tone,
  label,
}: {
  value: number;
  tone: Tone;
  label: string;
}) {
  const pct = Math.max(0, Math.min(value, 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
    >
      <div
        className={`h-full rounded-full ${tones[tone].bar}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const toneForCategory = (v: number | null): Tone =>
  v === null ? "neutral" : v > 70 ? "good" : v > 30 ? "warn" : "bad";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/");

  const { env } = getCloudflareContext();

  const jwtSecret =
    (env as unknown as Record<string, string | undefined>).JWT_SECRET ??
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured");
    redirect("/login");
  }

  const secret = new TextEncoder().encode(jwtSecret);

  let userId: string;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string") {
      redirect("/login");
    }

    userId = payload.sub;
  } catch {
    redirect("/login");
  }

  const db = env.Ekonos;

  const user = await db
    .prepare(
      "SELECT name, public_id, budget, ethical_score FROM users WHERE public_id = ?",
    )
    .bind(userId!)
    .first<UserRow>();

  const name = user?.name;
  const public_id = userId!;

  const transactionsResult = await db
    .prepare(
      `
        SELECT amount_pence
        FROM transactions
        WHERE user_id = ?
          AND created_at >= date('now', 'start of month')
    `,
    )
    .bind(public_id)
    .all<TransactionRow>();

  const recentResult = await db
    .prepare(
      `SELECT ${TX_COLUMNS}
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC, rowid DESC
       LIMIT 5`,
    )
    .bind(public_id)
    .all<TransactionItem>();
  const recent = recentResult.results ?? [];

  // How many scored transactions each category has. A score only means
  // something once there is at least one, so this decides "no data yet".
  const countsResult = await db
    .prepare(
      `SELECT category, COUNT(*) AS n, AVG(ethical_score) AS avg_score
       FROM transactions
       WHERE user_id = ?
       GROUP BY category`,
    )
    .bind(public_id)
    .all<{ category: string; n: number; avg_score: number | null }>();
  const countFor = (category: string) =>
    (countsResult.results ?? []).find((r) => r.category === category)?.n ?? 0;
  const avgFor = (category: string) =>
    (countsResult.results ?? []).find((r) => r.category === category)
      ?.avg_score ?? null;
  const totalCount = (countsResult.results ?? []).reduce(
    (sum, r) => sum + r.n,
    0,
  );

  // Category limits. If the table hasn't been created yet, skip the section
  // rather than breaking the whole dashboard.
  let limits: { category: string; amount_pence: number }[] = [];
  try {
    const limitsResult = await db
      .prepare(
        "SELECT category, amount_pence FROM category_budgets WHERE user_id = ?",
      )
      .bind(public_id)
      .all<{ category: string; amount_pence: number }>();
    limits = limitsResult.results ?? [];
  } catch {
    limits = [];
  }

  // This month's spending per category (same month boundary as the totals above).
  const spentResult = await db
    .prepare(
      `SELECT category, SUM(amount_pence) AS spent
       FROM transactions
       WHERE user_id = ?
         AND created_at >= date('now', 'start of month')
       GROUP BY category`,
    )
    .bind(public_id)
    .all<{ category: string; spent: number }>();
  const spentFor = (category: string) =>
    (spentResult.results ?? []).find((r) => r.category === category)?.spent ?? 0;

  const categoryLimits = CATEGORIES.map((category) => ({
    category,
    limit: limits.find((l) => l.category === category)?.amount_pence ?? 0,
  }))
    .filter((c) => c.limit > 0)
    .map((c) => {
      const spent = spentFor(c.category);
      const pct = (spent / c.limit) * 100;
      const tone: Tone = pct >= 100 ? "bad" : pct >= 80 ? "warn" : "good";
      return { ...c, spent, pct, tone };
    });

  const total_spent =
    (transactionsResult.results?.reduce(
      (sum, t) => sum + (t.amount_pence || 0),
      0,
    ) ?? 0) / 100;
  const budget = Math.floor((user?.budget ?? 0) * 100) / 100;
  // null = no scored purchases yet. A genuine score of 0 is kept as 0.
  const ethics: number | null =
    totalCount > 0 && user?.ethical_score != null
      ? Math.round(user.ethical_score)
      : null;

  const d = new Date();
  const day = d.getDate();
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  // Placeholder for demonstration purposes not 0 will break!!!!
  const percentage_spent = budget ? (total_spent / budget) * 100 : 0;

  const adjusted_percentage_spent = percentage_spent / (day / days);
  const remaining_budget = Math.round((budget - total_spent) * 100) / 100;

  // Same thresholds as before, expressed as tones.
  const budgetTone: Tone =
    adjusted_percentage_spent > 100
      ? "bad"
      : adjusted_percentage_spent > 75
        ? "warn"
        : "good";
  const ethicsTone: Tone =
    ethics === null
      ? "neutral"
      : ethics >= 75
        ? "good"
        : ethics >= 38
          ? "warn"
          : "bad";

  const placeholder_text = "Generating Ethical Feedback...";
  const daysLeft = days - day + 1;

  // Only categories that have transactions, busiest first. The top few are
  // shown; the rest sit behind a "Show more" toggle so phones stay uncluttered.
  const scoredCategories = CATEGORIES.map((label) => ({
    label,
    count: countFor(label),
    value: avgFor(label),
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const visibleCategories = scoredCategories.slice(0, 4);
  const moreCategories = scoredCategories.slice(4);

  return (
    <div className="relative isolate flex flex-1 flex-col">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.18),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.10),transparent)]"
      />

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/dashboard"
          aria-label="Ekonos dashboard"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9]"
        >
          <Image
            src="/EKONOS.svg"
            alt="Ekonos"
            width={100}
            height={100}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/add-item"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#65e2b9] px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9]"
          >
            Add payment
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-[#65e2b9]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-4 sm:px-8 lg:px-12">
        <h1 className="text-[clamp(1.75rem,3vw+1rem,2.5rem)] font-semibold leading-tight tracking-tight">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Here’s how this month is going.
        </p>

        {/* Summary cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href="/add-item" className={linkCardClass}>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Spent this month
            </div>
            <div
              className={`mt-2 text-3xl font-semibold tracking-tight ${tones[budgetTone].text}`}
            >
              {gbp.format(total_spent)}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              Out of {gbp.format(budget)}
            </div>
            <div className="mt-4">
              <Bar
                value={percentage_spent}
                tone={budgetTone}
                label="Budget used"
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {Math.min(percentage_spent, 100).toFixed(0)}% of budget used
            </div>
          </Link>

          <Link href="/edit-budget" className={linkCardClass}>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Remaining budget
            </div>
            <div
              className={`mt-2 text-3xl font-semibold tracking-tight ${tones[budgetTone].text}`}
            >
              {gbp.format(remaining_budget)}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </div>
            <div className="mt-4 text-xs text-zinc-500 underline underline-offset-4">
              Edit budget
            </div>
          </Link>

          <Link href="/ethical-breakdown" className={linkCardClass}>
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Ethical score
            </div>
            <div
              className={`mt-2 text-3xl font-semibold tracking-tight ${tones[ethicsTone].text}`}
            >
              {ethics ?? "–"}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              {ethics === null ? "Add a payment to get your score" : "out of 100"}
            </div>
          </Link>
        </div>

        {/* Category budgets */}
        <section
          className={`${cardClass} mt-4`}
          aria-labelledby="category-budgets-heading"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="category-budgets-heading"
              className="text-base font-semibold tracking-tight"
            >
              Category budgets
            </h2>
            <Link
              href="/category-budgets"
              className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {categoryLimits.length === 0 ? "Set limits" : "Edit limits"}
            </Link>
          </div>

          {categoryLimits.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Set a monthly limit for shopping, transport and other spending to
              see how each one is going.
            </p>
          ) : (
            <ul className="mt-5 grid gap-6 sm:grid-cols-3">
              {categoryLimits.map((c) => {
                const left = c.limit - c.spent;
                return (
                  <li key={c.category}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">{c.category}</span>
                      <span className="text-xs text-zinc-500">
                        {gbp.format(c.spent / 100)} of {gbp.format(c.limit / 100)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Bar
                        value={c.pct}
                        tone={c.tone}
                        label={`${c.category} budget used`}
                      />
                    </div>
                    <p className={`mt-2 text-sm ${tones[c.tone].text}`}>
                      {left < 0
                        ? `Over by ${gbp.format(-left / 100)}`
                        : c.pct >= 80
                          ? `Close to your limit: ${gbp.format(left / 100)} left`
                          : `${gbp.format(left / 100)} left`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Detail cards */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className={cardClass} aria-labelledby="breakdown-heading">
            <h2
              id="breakdown-heading"
              className="text-base font-semibold tracking-tight"
            >
              Your ethical breakdown
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <div
                aria-label={
                  ethics === null
                    ? "No ethical score yet"
                    : `Overall ethical score ${ethics} out of 100`
                }
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 text-lg font-semibold ${tones[ethicsTone].border} ${tones[ethicsTone].text}`}
              >
                {ethics ?? "–"}
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {ethics === null
                  ? "Your score appears once you’ve added a payment."
                  : placeholder_text}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {scoredCategories.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Category scores appear once you’ve added a payment.
                </p>
              )}
              {visibleCategories.map((c) => (
                <div key={c.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-zinc-500">
                      {c.value === null ? "No data yet" : Math.round(c.value)}
                    </span>
                  </div>
                  <Bar
                    value={c.value ?? 0}
                    tone={toneForCategory(c.value)}
                    label={`${c.label} ethical score`}
                  />
                </div>
              ))}

              {moreCategories.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
                    Show {moreCategories.length} more
                  </summary>
                  <div className="mt-4 space-y-4">
                    {moreCategories.map((c) => (
                      <div key={c.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{c.label}</span>
                          <span className="text-zinc-500">
                            {c.value === null
                              ? "No data yet"
                              : Math.round(c.value)}
                          </span>
                        </div>
                        <Bar
                          value={c.value ?? 0}
                          tone={toneForCategory(c.value)}
                          label={`${c.label} ethical score`}
                        />
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </section>

          <section className={cardClass} aria-labelledby="transactions-heading">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="transactions-heading"
                className="text-base font-semibold tracking-tight"
              >
                Past transactions
              </h2>
              <Link
                href="/transactions"
                className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                View all
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                Nothing logged yet. Add a payment to see it here.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {recent.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.brand}</p>
                      <p className="text-xs text-zinc-500">{t.category}</p>
                    </div>
                    <p className="flex-shrink-0 text-sm font-semibold">
                      {gbp.format(t.amount_pence / 100)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
