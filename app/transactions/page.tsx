import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getUserId } from "../lib/auth";
import { TX_COLUMNS } from "../lib/transactions";
import type { TransactionItem } from "../lib/transaction-types";
import { TransactionList } from "./transaction-list";

// Account pages should never appear in search results.
export const metadata: Metadata = {
  title: "Transactions",
  robots: { index: false, follow: false },
};

export default async function TransactionsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { env } = getCloudflareContext();
  const { results } = await env.Ekonos.prepare(
    `SELECT ${TX_COLUMNS}
     FROM transactions
     WHERE user_id = ?
     ORDER BY created_at DESC, rowid DESC
     LIMIT 200`,
  )
    .bind(userId)
    .all<TransactionItem>();

  return (
    <div className="relative isolate flex flex-1 flex-col">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.18),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.10),transparent)]"
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
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/add-item"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#65e2b9] px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9]"
          >
            Add payment
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-4 sm:px-8">
        <h1 className="text-[clamp(1.75rem,3vw+1rem,2.5rem)] font-semibold leading-tight tracking-tight">
          Transactions
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Search, correct or remove anything you’ve logged.
        </p>

        <TransactionList initial={results ?? []} />
      </main>
    </div>
  );
}
