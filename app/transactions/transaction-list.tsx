"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, type TransactionItem } from "../lib/transaction-types";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#65e2b9] dark:focus:ring-[#65e2b9]/25";

const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9]";

const smallButton = `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${focusRing}`;

// Same thresholds as the dashboard's overall score.
function scoreClass(score: number | null) {
  if (score === null) return "text-zinc-500";
  if (score >= 75) return "text-emerald-600 dark:text-[#65e2b9]";
  if (score >= 38) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// occurred_on is a plain calendar date (YYYY-MM-DD) in UK time.
function formatDate(value: string | null) {
  if (!value) return "";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(d);
}

type EditForm = {
  id: number;
  brand: string;
  price: string;
  category: string;
  score: string;
};

export function TransactionList({ initial }: { initial: TransactionItem[] }) {
  const router = useRouter();

  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | (typeof CATEGORIES)[number]>(
    "All",
  );
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (t) =>
        (filter === "All" || t.category === filter) &&
        t.brand.toLowerCase().includes(q),
    );
  }, [items, query, filter]);

  const shownTotal = shown.reduce((sum, t) => sum + (t.amount_pence || 0), 0);

  const startEdit = (t: TransactionItem) => {
    setError(null);
    setConfirmingId(null);
    setEditing({
      id: t.id,
      brand: t.brand,
      price: (t.amount_pence / 100).toFixed(2),
      category: t.category,
      score: t.ethical_score === null ? "" : String(Math.round(t.ethical_score)),
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);

    const price = Number(editing.price);
    const score = Number(editing.score);

    if (!editing.brand.trim() || !editing.price || !editing.score) {
      setError("All fields are required");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid price");
      return;
    }
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      setError("Ethical score must be between 0 and 100");
      return;
    }

    setBusyId(editing.id);
    try {
      const response = await fetch(`/api/transactions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: editing.brand.trim(),
          price,
          category: editing.category,
          ethical_score: score,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save changes");
      }

      setItems((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? {
                ...t,
                brand: editing.brand.trim(),
                amount_pence: Math.round(price * 100),
                category: editing.category,
                ethical_score: score,
              }
            : t,
        ),
      );
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setBusyId(null);
    }
  };

  const deleteItem = async (id: number) => {
    setError(null);
    setBusyId(id);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete transaction");
      }

      setItems((prev) => prev.filter((t) => t.id !== id));
      setConfirmingId(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Empty state ---------- */
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold tracking-tight">
          No transactions yet
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add your first payment and it will show up here.
        </p>
        <Link
          href="/add-item"
          className={`mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#65e2b9] px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] ${focusRing}`}
        >
          Add payment
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Search and filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search transactions by brand
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search by brand"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
          />
        </div>
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-2"
        >
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${focusRing} ${
                filter === c
                  ? "border-[#65e2b9] bg-[#65e2b9] text-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500" aria-live="polite">
        {shown.length} {shown.length === 1 ? "transaction" : "transactions"}
        {shown.length > 0 && <> · {gbp.format(shownTotal / 100)} in total</>}
        {items.length >= 200 && " (showing your latest 200)"}
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Nothing matches your search.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {shown.map((t) => {
            const isEditing = editing?.id === t.id;
            const isConfirming = confirmingId === t.id;
            const busy = busyId === t.id;

            return (
              <li
                key={t.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {isEditing && editing ? (
                  <form onSubmit={saveEdit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor={`brand-${t.id}`} className={labelClass}>
                          Brand
                        </label>
                        <input
                          id={`brand-${t.id}`}
                          type="text"
                          value={editing.brand}
                          onChange={(e) =>
                            setEditing({ ...editing, brand: e.target.value })
                          }
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor={`price-${t.id}`} className={labelClass}>
                          Price (£)
                        </label>
                        <input
                          id={`price-${t.id}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={editing.price}
                          onChange={(e) =>
                            setEditing({ ...editing, price: e.target.value })
                          }
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`category-${t.id}`}
                          className={labelClass}
                        >
                          Category
                        </label>
                        <select
                          id={`category-${t.id}`}
                          value={editing.category}
                          onChange={(e) =>
                            setEditing({ ...editing, category: e.target.value })
                          }
                          required
                          className={inputClass}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`score-${t.id}`} className={labelClass}>
                          Ethical score (0 to 100)
                        </label>
                        <input
                          id={`score-${t.id}`}
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          step="1"
                          value={editing.score}
                          onChange={(e) =>
                            setEditing({ ...editing, score: e.target.value })
                          }
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className={`${smallButton} bg-[#65e2b9] text-zinc-900 hover:bg-[#4fd3a8] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {busy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditing(null);
                          setError(null);
                        }}
                        className={`${smallButton} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.brand}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {[formatDate(t.occurred_on), t.category]
                            .filter(Boolean)
                            .join(" · ")}
                          {" · "}
                          <span className={scoreClass(t.ethical_score)}>
                            {t.ethical_score === null
                              ? "Not scored"
                              : `Score ${Math.round(t.ethical_score)}`}
                          </span>
                        </p>
                      </div>
                      <p className="flex-shrink-0 text-lg font-semibold tracking-tight">
                        {gbp.format(t.amount_pence / 100)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isConfirming ? (
                        <>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            Delete this transaction?
                          </span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteItem(t.id)}
                            className={`${smallButton} bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {busy ? "Deleting…" : "Yes, delete"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmingId(null)}
                            className={`${smallButton} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800`}
                          >
                            Keep it
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            className={`${smallButton} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setError(null);
                              setEditing(null);
                              setConfirmingId(t.id);
                            }}
                            className={`${smallButton} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
