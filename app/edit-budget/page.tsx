"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const labelClass = "mb-1.5 block text-sm font-medium";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#65e2b9] dark:focus:ring-[#65e2b9]/25";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Turns any budget period into a monthly amount (same maths as before).
function toMonthly(amount: number, timescale: string): number {
  let adjusted_budget = amount;

  switch (timescale) {
    case "Daily":
      adjusted_budget = (adjusted_budget * 365) / 12;
      break;
    case "Weekly":
      adjusted_budget = ((adjusted_budget / 7) * 365) / 12;
      break;
    case "Monthly":
      break;
    case "Yearly":
      adjusted_budget = adjusted_budget / 12;
      break;
  }

  return adjusted_budget;
}

export default function EditBudgetPage() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [timescale, setTimescale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = Number(budget);
  const showPreview =
    budget !== "" &&
    Number.isFinite(amount) &&
    amount >= 0 &&
    timescale !== "" &&
    timescale !== "Monthly";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!timescale || !budget) {
      setError("All fields are required");
      return;
    }

    const adjusted_budget = toMonthly(Number(budget), timescale);

    setLoading(true);

    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjusted_budget }),
      });

      if (!response.ok) {
        throw new Error("Failed to add budget");
      }

      await response.json();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add budget");
      setLoading(false);
    }
  };

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
            Edit your budget
          </h1>
          <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Tell us how much you plan to spend and how often. We’ll turn it
            into a monthly budget.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="budget" className={labelClass}>
                Budget amount
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-500"
                >
                  £
                </span>
                <input
                  id="budget"
                  type="number"
                  inputMode="decimal"
                  min="0.00"
                  step={0.01}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="timescale" className={labelClass}>
                How often?
              </label>
              <select
                id="timescale"
                value={timescale}
                onChange={(e) => setTimescale(e.target.value)}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select how often
                </option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              {showPreview && (
                <p className="mt-2 text-sm text-zinc-500" aria-live="polite">
                  That’s about {gbp.format(toMonthly(amount, timescale))} a
                  month.
                </p>
              )}
            </div>

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
              {loading ? "Saving…" : "Save budget"}
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
        </div>
      </main>
    </div>
  );
}
