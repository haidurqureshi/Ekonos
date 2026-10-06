"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const labelClass = "mb-1.5 block text-sm font-medium";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#65e2b9] dark:focus:ring-[#65e2b9]/25";

export default function AddTransactionPage() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [ethicalScore, setEthicalScore] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brand || !price || !ethicalScore || !category) {
      setError("All fields are required");
      return;
    }

    const priceNumber = Number(price);
    const ethicalScoreNumber = Number(ethicalScore);

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Please enter a valid price");
      return;
    }

    if (
      !Number.isFinite(ethicalScoreNumber) ||
      ethicalScoreNumber < 0 ||
      ethicalScoreNumber > 100
    ) {
      setError("Ethical score must be between 0 and 100");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          price: priceNumber,
          category,
          ethical_score: ethicalScoreNumber,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to add transaction");
      }

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
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
            Add a transaction
          </h1>
          <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Log a purchase and rate how ethical it was.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="brand" className={labelClass}>
                Brand
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>
                Price
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-500"
                >
                  £
                </span>
                <input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="ethical-score" className={labelClass}>
                Ethical score
              </label>
              <input
                id="ethical-score"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="100"
                value={ethicalScore}
                onChange={(e) => setEthicalScore(e.target.value)}
                required
                aria-describedby="score-hint"
                className={inputClass}
              />
              <p id="score-hint" className="mt-1.5 text-xs text-zinc-500">
                From 0 to 100. A higher score means a more ethical purchase.
              </p>
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
              {loading ? "Adding…" : "Add transaction"}
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
