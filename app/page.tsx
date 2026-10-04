import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ethical Budgeting: How to Budget in Line With Your Values",
  description:
    "A practical guide to ethical budgeting: how to track your spending, see where your money really goes, and make changes that match your values.",
  alternates: { canonical: "/guides/ethical-budgeting" },
};

const steps = [
  {
    title: "Track what you earn and spend",
    text: "A budget starts with an honest picture. Record your income and every transaction for a month or two, so you are working from what actually happens rather than what you think happens.",
  },
  {
    title: "Note who you spend with, not just how much",
    text: "Most budgets group spending into categories such as groceries or transport. For ethical budgeting, also record the company behind each purchase. This is the step that turns a normal budget into an ethical one.",
  },
  {
    title: "Decide what matters to you",
    text: "Ethical means different things to different people. You might care most about the environment, how workers are treated, tax conduct, animal welfare, or something else. Write down your top two or three priorities so you have something to measure against.",
  },
  {
    title: "Look at where the money goes",
    text: "Sort your spending by company and see which ones take the largest share. Your biggest, most regular outgoings, such as energy, your bank, your phone provider and your weekly shop, usually matter far more than occasional purchases.",
  },
  {
    title: "Change what is realistic",
    text: "You don’t have to overhaul everything at once. Pick one or two large, regular costs and look at alternatives. Ethical options are sometimes more expensive and sometimes not, which is exactly why you want to see the numbers before you decide.",
  },
  {
    title: "Review regularly",
    text: "Check in monthly. Your income, prices and priorities all change, and a short regular review keeps your budget and your values pointing the same way.",
  },
];

export default function EthicalBudgetingGuide() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
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
            className="h-10 w-auto"
          />
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Log in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-6 sm:px-8 sm:pt-12">
        <article>
          <span
            aria-hidden="true"
            className="mb-5 block h-1 w-10 rounded-full bg-[#65e2b9]"
          />
          <h1 className="text-[clamp(2rem,4vw+1rem,3.25rem)] font-semibold leading-tight tracking-tight text-balance">
            Ethical budgeting: how to budget in line with your values
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A normal budget tells you how much you spend. An ethical budget also
            shows you who you spend it with. This guide walks through how to
            build one, step by step.
          </p>

          <section className="mt-12 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              What is ethical budgeting?
            </h2>
            <p className="leading-7 text-zinc-700 dark:text-zinc-300">
              Ethical budgeting means planning and tracking your money with
              your values in mind. Alongside the usual questions of how much
              you earn and how much you spend, it adds another: do the
              companies I give my money to line up with what I care about?
              It is not about perfection. It is about seeing clearly, then
              making the changes that matter most to you.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold tracking-tight">
              How to start: six steps
            </h2>
            <ol className="mt-6 space-y-6">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#65e2b9] text-sm font-semibold text-zinc-900"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1 leading-7 text-zinc-700 dark:text-zinc-300">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              How Ekonos helps
            </h2>
            <p className="leading-7 text-zinc-700 dark:text-zinc-300">
              Ekonos is a free budgeting app built around exactly this idea.
              You record your income and spending, tag each transaction with
              the company, and Ekonos shows an ethical score reflecting how
              your spending lines up with ethical and environmental
              considerations. You enter your own data, and Ekonos doesn’t
              connect to your bank accounts.
            </p>
            <p className="leading-7 text-zinc-700 dark:text-zinc-300">
              Ethical scores are our own assessment of publicly available
              information and are a general guide only.
            </p>
            <div className="pt-3">
              <Link
                href="/start"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#65e2b9] px-7 text-base font-medium text-zinc-900 transition-colors hover:bg-[#4fd3a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:focus-visible:outline-[#65e2b9]"
              >
                Start now, it’s free
              </Link>
            </div>
          </section>

          <p className="mt-12 text-xs leading-5 text-zinc-500">
            This guide is general information, not financial, investment, tax
            or legal advice. For significant financial decisions, speak to a
            qualified adviser.
          </p>
        </article>
      </main>
    </div>
  );
}
