import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ekonos.co.uk"),
  title: {
    default: "Ekonos | Ethical personal finance",
    template: "%s | Ekonos",
  },
  description:
    "Ekonos is a free budgeting tool that helps you track your spending and see how it lines up with your values.",
  applicationName: "Ekonos",
  openGraph: {
    type: "website",
    siteName: "Ekonos",
    locale: "en_GB",
  },
};

const footerLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Ethical Principles", href: "/our-ethical-principles" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const linkStyles =
  "rounded-sm text-sm text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-zinc-400 dark:hover:text-zinc-50";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}

        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12">
            <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} Ekonos. Co-developed and
              operated by{" "}
              <a href="https://haidurqureshi.com" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
                HaidurQureshi Ltd
              </a>
              . Registered in England and Wales. Company number: 16936643.
            </p>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkStyles}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://forms.gle/73AvFfMHRRXmkDnU7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyles}
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
