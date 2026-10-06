"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const labelClass = "mb-1.5 block text-sm font-medium";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#65e2b9] dark:focus:ring-[#65e2b9]/25";

const textLink =
  "font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data: { success?: boolean; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push("/edit-budget");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account",
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
          href="/"
          aria-label="Ekonos home"
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
          href="/login"
          className="text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Log in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16 pt-4 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
          <span
            aria-hidden="true"
            className="mb-5 block h-1 w-8 rounded-full bg-[#65e2b9]"
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Start budgeting with your values in mind. It’s free.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                aria-describedby="password-hint"
                className={inputClass}
              />
              <p
                id="password-hint"
                className="mt-1.5 text-xs text-zinc-500"
              >
                At least 8 characters.
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 flex-shrink-0 accent-[#65e2b9]"
              />
              <span>
                I’m 16 or over, and I accept the{" "}
                <Link href="/privacy-policy" className={textLink}>
                  privacy policy
                </Link>{" "}
                and the{" "}
                <Link href="/terms-of-service" className={textLink}>
                  terms of service
                </Link>
                .
              </span>
            </label>

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
              {loading ? "Creating account…" : "Sign up"}
            </button>

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className={textLink}>
                Log in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
