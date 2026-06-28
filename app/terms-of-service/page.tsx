import Image from "next/image";
import Link from "next/link";

export default async function Terms() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between gap-8 py-15 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="w-full flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <Link href="/" aria-label="Ekonos Logo" className="flex items-center justify-center sm:justify-start">
            <Image
              src="/EKONOS.svg"
              alt="EKONOS logo"
              width={100}
              height={100}
              priority
            />
          </Link>

          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Ekonos Terms of Service
            </p>
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Last updated: 28 June 2026
            </h1>
          </div>
        </div>

        <div className="w-full space-y-8">
          <section className="space-y-4">
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Operated by: HaidurQureshi Ltd
              <br />Trading as: Ekonos
              <br />Website: ekonos.co.uk
              <br />Contact email: tos@ekonos.co.uk
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              By creating an account or using Ekonos, you agree to these Terms of Service. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">What Ekonos is</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Ekonos is a personal budgeting tool that helps you track your income and spending, and provides an &quot;ethical score&quot; reflecting how your spending aligns with ethical and environmental considerations, based on the companies you record transactions against.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Ekonos is currently free to use. There are no paid features or charges at this time. If this changes in future, we will update these terms and notify users in advance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Not financial advice</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Ekonos does not provide financial, investment, tax, or legal advice. The budgeting information, ethical scores, and any insights shown in the app are for general informational purposes only and should not be relied upon as a substitute for professional advice.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              You are responsible for your own financial decisions. We strongly recommend speaking to a qualified financial adviser before making significant financial decisions.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Ethical scores are based on our own assessment of publicly available information about companies and are provided as a general guide only. We do not guarantee the accuracy, completeness, or current relevance of any ethical scoring shown.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your account</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              You must provide accurate information when creating an account. You are responsible for keeping your login details secure and for all activity under your account. If you believe your account has been accessed without your permission, contact us immediately.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              You must be at least 16 years old to use Ekonos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your data</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              All financial data you enter into Ekonos (income, transactions, budgets) is entered manually by you. We do not currently connect directly to your bank accounts. How we collect, store, and use your data is explained fully in our{" "}
              <Link href="/privacy-policy" className="text-foreground hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Acceptable use</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              You agree not to:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
              <li>Use Ekonos for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to other users&apos; accounts or data.</li>
              <li>Attempt to disrupt, overload, or interfere with the operation of the service.</li>
              <li>Reverse engineer, scrape, or copy the service without our permission.</li>
            </ul>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We may suspend or terminate accounts that breach these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Service availability</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Ekonos is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee uninterrupted or error-free service. As an early-stage product, features may change, and the service may experience downtime or bugs as we continue to develop it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Limitation of liability</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              To the fullest extent permitted by law, HaidurQureshi Ltd is not liable for any indirect, incidental, or consequential loss arising from your use of Ekonos, including financial decisions made based on information shown in the app.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Nothing in these terms limits liability for death, personal injury, or fraud, where such limitation would be unlawful.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Changes to these terms</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We may update these terms from time to time. If we make material changes, we will notify users via the app or by email where possible. Continued use of Ekonos after changes take effect means you accept the updated terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Termination</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              You may delete your account at any time. We may suspend or terminate your access if you breach these terms, or if we discontinue the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Governing law</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Contact</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Questions about these terms can be sent to tos@ekonos.co.uk.
            </p>
          </section>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: June 2026</p>
        </div>
      </main>
    </div>
  );
}