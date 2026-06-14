import Image from "next/image";
import Link from "next/link";

export default async function Privacy() {
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
              Ekonos Privacy Policy
            </p>
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Last updated: 14 June 2026
            </h1>
          </div>
        </div>

        <div className="w-full space-y-8">
          <section className="space-y-4">
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Registered company: HaidurQureshi Ltd
              <br />Trading as: Ekonos
              <br />Website: ekonos.co.uk
              <br />Contact email: haidur@haidurqureshi.com
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We are the controller of your personal data. This privacy notice explains what information we collect, how we use it, and your rights under UK data protection law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">What information we collect and why</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              When you create an account we collect your full name, email address, and a hashed (encrypted) version of your password. We never store your password in plain text.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              When you use the Ekonos dashboard we collect financial information you voluntarily enter, including income, spending transactions, and company names. This information is used solely to provide you with the Ekonos service.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We do not collect payment card details, bank account numbers, or any information you have not explicitly provided to us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">How we store your data</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Your data is stored securely in Cloudflare D1, a cloud database service operated by Cloudflare Inc., located in data centres within the United States and European Union. Cloudflare is certified under the EU-US Data Privacy Framework. Your data is encrypted in transit using TLS and encrypted at rest.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Passwords are hashed using bcrypt before storage. This means even we cannot read your password.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We use a strictly necessary session cookie to keep you logged in. This cookie contains a signed token and does not track you across other websites. It expires after 7 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Lawful bases for processing</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We rely on the following lawful bases under UK GDPR:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Consent</strong> — when you create an account you consent to us processing your name, email, and financial data to provide the Ekonos service. You may withdraw consent at any time by deleting your account.
              </li>
              <li>
                <strong>Legitimate interests</strong> — we process minimal technical data to keep the service secure and functioning, including login activity and error logs.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Where we get your information from</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              All personal data we hold is provided directly by you. We do not purchase data from third parties or obtain your data from other sources.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Who we share your data with</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We share your data with the following third party solely for the purpose of hosting and operating the service:
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Cloudflare Inc. — database hosting, content delivery, and DDoS protection. Cloudflare processes data on our behalf under a Data Processing Agreement.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We do not sell your data. We do not share your data with advertisers. We do not use your data for any purpose other than providing the Ekonos service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">How long we keep your information</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We retain your account data for as long as your account is active. If you request account deletion, we will permanently delete all your personal data within 30 days.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Anonymised, aggregated data (containing no personal identifiers) may be retained for service improvement purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Your data protection rights</h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-zinc-600 dark:text-zinc-400">
              <li>Right of access — you can request a copy of all personal data we hold about you.</li>
              <li>Right to rectification — you can ask us to correct inaccurate data.</li>
              <li>Right to erasure — you can ask us to delete your data.</li>
              <li>Right to restriction — you can ask us to limit how we use your data.</li>
              <li>Right to object — you can object to us processing your data.</li>
              <li>Right to data portability — you can ask us to transfer your data to another service.</li>
              <li>Right to withdraw consent — you can withdraw consent at any time.</li>
            </ul>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              To exercise any of these rights, email us at haidur@haidurqureshi.com. We will respond within one month.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Cookies</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We use one strictly necessary cookie named token. This cookie keeps you logged in and expires after 7 days. It does not track you and is not used for advertising. You can delete this cookie at any time by logging out.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              We do not use analytics cookies, advertising cookies, or any third party tracking.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Changes to this privacy notice</h2>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              If you have concerns about how we handle your data, please contact us first at haidur@haidurqureshi.com.
            </p>
            <p className="text-base leading-8 text-zinc-600 dark:text-zinc-400">
              If you remain unhappy after contacting us, you can complain to the ICO:
            </p>
            <address className="not-italic text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Information Commissioner&apos;s Office
              <br />Wycliffe House, Water Lane
              <br />Wilmslow, Cheshire, SK9 5AF
              <br />Helpline: 0303 123 1113
              <br />Website: <a href="https://ico.org.uk/make-a-complaint" className="text-foreground hover:underline">ico.org.uk/make-a-complaint</a>
            </address>
          </section>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: June 2026</p>
        </div>
      </main>
    </div>
  );
}
