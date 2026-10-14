// Safe to import from both server and client code (no server-only imports here).

export const CATEGORIES = ["Shopping", "Transport", "Other"] as const;

export type TransactionItem = {
  id: number;
  brand: string;
  amount_pence: number;
  category: string;
  ethical_score: number;
  created_at: string | null;
};
