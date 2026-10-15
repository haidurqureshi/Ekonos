"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "../lib/transaction-types";

const labelClass = "mb-1.5 block text-sm font-medium";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pl-9 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#65e2b9] dark:focus:ring-[#65e2b9]/25";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const hints: Record<string, string> = {
  Shopping: "Groceries, clothes, household and online shopping",
  Transport: "Fuel, public transport, taxis and travel",
  Other: "Eating out, bills, subscriptions and everything else",
};

export function CategoryBudgetsForm({
  initial,
  overallBudget,
}: {
  initial: Record<string, string>;
  overallBudget: number;
}) {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c, initial[c] ?? ""])),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = CATEGORIES.reduce(
    (sum, c) => sum + (Number(values[c]) > 0 ? Number(values[c]) : 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const budgets: Record<string, number | null> = {};
    for (const c of CATEGORIES) {
      const raw = values[c].trim();
      if (raw === "") {
        budgets[c] = null;
        continue;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        setError(`Please enter a valid amount for ${c}`);
        return;
      }
      budgets[c] = n;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/category-budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgets }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save category budgets");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category budgets",
      );
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {CATEGORIES.map((c) => (
        <div key={c}>
          <label htmlFor={`budget-${c}`} className={labelClass}>
            {c}
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-500"
            >
              £
            </span>
            <input
              id={`budget-${c}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="No limit"
              value={values[c]}
              onChange={(e) => setValues({ ...values, [c]: e.target.value })}
              aria-describedby={`hint-${c}`}
              className={inputClass}
            />
          </div>
          <p id={`hint-${c}`} className="mt-1.5 text-xs text-zinc-500">
            {hints[c]}
          </p>
        </div>
      ))}

      {total > 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
          Your limits add up to {gbp.format(total)} a month.
          {overallBudget > 0 &&
            (total > overallBudget
              ? ` That’s ${gbp.format(total - overallBudget)} more than your overall budget of ${gbp.format(overallBudget)}.`
              : ` That leaves ${gbp.format(overallBudget - total)} of your overall budget of ${gbp.format(overallBudget)} unassigned.`)}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#65e2b9] text-base font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:outline-[#65e2b9]"
      >
        {loading ? "Saving…" : "Save category budgets"}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Cancel
        </Link>
      </p>
    </form>
  );
}
