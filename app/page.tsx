import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Track your spending",
    text: "Record your income and transactions in one clear dashboard.",
  },
  {
    title: "See your ethical score",
    text: "Find out how your spending lines up with ethical and environmental considerations, company by company.",
  },
  {
    title: "Stay in control",
    text: "You enter your own data. Ekonos doesn’t connect to your bank accounts.",
  },
];

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Ekonos home"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
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
          className="rounded-full text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-24">
        <h1 className="max-w-3xl text-[clamp(2.25rem,6vw+0.5rem,4.5rem)] font-semibold leading-[1.05] tracking-tight text-balance">
          Budgeting that reflects your values.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:mt-8 sm:text-lg sm:leading-8 dark:text-zinc-400">
          Track your spending, see which companies align with your values, and
          take control of your financial future, ethically and effortlessly.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
          <Link
            href="/start"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-base font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-40"
          >
            Start now
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-7 text-base font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Log in
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-500">Free to use.</p>

        {/* What it does */}
        <ul className="mt-16 grid gap-x-10 gap-y-8 border-t border-zinc-200 pt-10 sm:mt-20 sm:grid-cols-3 dark:border-zinc-800">
          {features.map((feature) => (
            <li key={feature.title}>
              <h2 className="text-base font-semibold tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-xs leading-5 text-zinc-500">
          Ekonos is a budgeting tool and does not provide financial advice.
          Ethical scores are our own assessment of publicly available
          information and are a general guide only.
        </p>
      </main>
    </div>
  );
}
