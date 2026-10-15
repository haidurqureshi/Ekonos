import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../lib/auth";
import { CategoryBudgetsForm } from "./category-budgets-form";

// Account pages should never appear in search results.
export const metadata: Metadata = {
  title: "Category budgets",
  robots: { index: false, follow: false },
};

export default async function CategoryBudgetsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { env } = getCloudflareContext();
  const db = env.Ekonos;

  // Current limits, as pounds strings for the form inputs.
  const initial: Record<string, string> = {};
  try {
    const { results } = await db
      .prepare(
        "SELECT category, amount_pence FROM category_budgets WHERE user_id = ?",
      )
      .bind(userId)
      .all<{ category: string; amount_pence: number }>();
    for (const row of results ?? []) {
      initial[row.category] = (row.amount_pence / 100).toFixed(2);
    }
  } catch {
    // The table hasn't been created yet; the form simply starts empty.
  }

  const user = await db
    .prepare("SELECT budget FROM users WHERE public_id = ?")
    .bind(userId)
    .first<{ budget: number }>();
  const overallBudget = Math.floor((user?.budget ?? 0) * 100) / 100;

  return (
    <div className="relative isolate flex flex-1 flex-col">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.22),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.12),transparent)]"
      />

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
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16 pt-4 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
          <span
            aria-hidden="true"
            className="mb-5 block h-1 w-8 rounded-full bg-[#65e2b9]"
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            Category budgets
          </h1>
          <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Set a monthly limit for each type of spending. Leave one blank if
            you don’t want a limit for it.
          </p>

          <CategoryBudgetsForm
            initial={initial}
            overallBudget={overallBudget}
          />
        </div>
      </main>
    </div>
  );
}
