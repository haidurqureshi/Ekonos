import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Ekonos",
  url: "https://ekonos.co.uk",
  description:
    "A free ethical budgeting app. Set a monthly budget, log your spending, and score each purchase so you can see how ethical your spending really is.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: {
    "@type": "Organization",
    name: "HaidurQureshi Ltd",
    url: "https://haidurqureshi.com",
  },
};

const faqs = [
  {
    q: "What is Ekonos?",
    a: "Ekonos is a free ethical budgeting app. You set a monthly budget, log your spending, and give each purchase an ethical score. Ekonos combines them into an overall score and a breakdown by category.",
  },
  {
    q: "How does the ethical score work?",
    a: "When you add a transaction, you rate how ethical that purchase was from 0 to 100. Ekonos averages your ratings into an overall ethical score, and into separate scores for shopping, transport and other spending.",
  },
  {
    q: "Does Ekonos connect to my bank?",
    a: "No. You enter your transactions yourself, so you stay in control of what information Ekonos holds.",
  },
  {
    q: "Is Ekonos free?",
    a: "Yes, Ekonos is currently free to use. If that ever changes, we will update our terms and tell users in advance.",
  },
  {
    q: "Is Ekonos financial advice?",
    a: "No. Ekonos is a budgeting tool, and nothing in it is financial, investment, tax or legal advice.",
  },
];

const features = [
  {
    title: "Set a monthly budget",
    text: "See how much you have spent, how much is left, and whether you are on track for the month.",
  },
  {
    title: "Score every purchase",
    text: "Log what you buy and rate how ethical it was. Ekonos turns your ratings into an overall ethical score.",
  },
  {
    title: "See where it comes from",
    text: "Break your score down by category, such as shopping and transport, to spot where you can improve.",
  },
];

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.22),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(101,226,185,0.12),transparent)]"
      />

      {/* Top bar */}
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
          className="rounded-full text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9] dark:text-zinc-400 dark:hover:text-zinc-50"
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
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#65e2b9] px-7 text-base font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9] sm:min-w-40"
          >
            Start now
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-7 text-base font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9] sm:min-w-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Log in
          </Link>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-500">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#65e2b9]"
          />
          Free to use
        </p>

        {/* What it does */}
        <ul className="mt-16 grid gap-x-10 gap-y-8 border-t border-zinc-200 pt-10 sm:mt-20 sm:grid-cols-3 dark:border-zinc-800">
          {features.map((feature) => (
            <li key={feature.title}>
              <span
                aria-hidden="true"
                className="mb-4 block h-1 w-8 rounded-full bg-[#65e2b9]"
              />
              <h2 className="text-base font-semibold tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>

        {/* Common questions */}
        <section className="mt-16 max-w-2xl sm:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            Common questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold tracking-tight">{item.q}</dt>
                <dd className="mt-1 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            New to budgeting with your values in mind? Read our{" "}
            <Link
              href="/guides/ethical-budgeting"
              className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              guide to ethical budgeting
            </Link>
            .
          </p>
        </section>

        <p className="mt-10 max-w-2xl text-xs leading-5 text-zinc-500">
          Ekonos is a budgeting tool and does not provide financial advice. Ethical scores reflect the ratings you enter and are a general guide only.
        </p>
      </main>
    </div>
  );
}
