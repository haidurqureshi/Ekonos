import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
  shopping_ethics: number;
  transport_ethics: number;
  other_ethics: number;
}

interface TransactionRow {
  amount_pence: number;
}

/* ---------- Presentation helpers ---------- */

type Tone = "good" | "warn" | "bad";

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

const toneForCategory = (v: number): Tone =>
  v > 70 ? "good" : v > 30 ? "warn" : "bad";

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
      "SELECT name, public_id, budget, ethical_score, shopping_ethics, transport_ethics, other_ethics FROM users WHERE public_id = ?",
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

  const total_spent =
    (transactionsResult.results?.reduce(
      (sum, t) => sum + (t.amount_pence || 0),
      0,
    ) ?? 0) / 100;
  const budget = Math.floor((user?.budget ?? 0) * 100) / 100;
  const ethics = Math.round(user?.ethical_score ?? 0) || 100;
  const shopping_ethics = user?.shopping_ethics || 100;
  const transport_ethics = user?.transport_ethics || 100;
  const other_ethics = user?.other_ethics || 100;

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
  const ethicsTone: Tone = ethics >= 75 ? "good" : ethics >= 38 ? "warn" : "bad";

  const placeholder_text = "Generating Ethical Feedback...";
  const daysLeft = days - day + 1;

  const categories = [
    { label: "Shopping", value: shopping_ethics },
    { label: "Transport", value: transport_ethics },
    { label: "Other", value: other_ethics },
  ];

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
              {ethics}
            </div>
            <div className="mt-1 text-sm text-zinc-500">out of 100</div>
          </Link>
        </div>

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
                aria-label={`Overall ethical score ${ethics} out of 100`}
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 text-lg font-semibold ${tones[ethicsTone].border} ${tones[ethicsTone].text}`}
              >
                {ethics}
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {placeholder_text}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {categories.map((c) => (
                <div key={c.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-zinc-500">{Math.round(c.value)}</span>
                  </div>
                  <Bar
                    value={c.value}
                    tone={toneForCategory(c.value)}
                    label={`${c.label} ethical score`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={cardClass} aria-labelledby="transactions-heading">
            <h2
              id="transactions-heading"
              className="text-base font-semibold tracking-tight"
            >
              Past transactions
            </h2>
            <p className="mt-4 text-sm text-zinc-500">Coming soon.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
