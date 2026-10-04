import type { Metadata } from "next";

// Keeps this account page out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
