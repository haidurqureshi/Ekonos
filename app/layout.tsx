import type { Metadata } from "next";
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
  title: "Ekonos",
  description: "Ethical personal finance",
};

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
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans dark:bg-black">
        {children}

        <footer className="flex flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black text-center py-4 ">
          <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-15 px-16 bg-white dark:bg-black items-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              &copy; 2026 Ekonos. Co-developed and operated by HaidurQureshi Ltd. Registered in England and Wales. Company Number: 16936643.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-center">
              <a href="/privacy-policy" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
                Terms of Service
              </a>
              <a href="/our-ethical-principles" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
                Our Ethical Principles
              </a>
              <a href="/contact" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
                Contact Us
              </a>
              <a href="/about-us" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
                About Us
              </a>
            </div>
          </main>
        </footer>
      </body>
    </html>
  );
}
