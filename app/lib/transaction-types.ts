// Safe to import from both server and client code (no server-only imports here).

// The categories users can choose. "Shopping", "Transport" and "Other" are the
// original three. Categories are checked here in code, not in the database,
// so adding one never needs a migration.
export const CATEGORIES = [
  "Bills & housing",
  "Food & drink",
  "Transport",
  "Shopping",
  "Leisure & subscriptions",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Short examples shown under each category when setting budgets.
export const CATEGORY_HINTS: Record<Category, string> = {
  "Bills & housing": "Rent, mortgage, energy, water, internet and phone",
  "Food & drink": "Groceries, takeaways, cafés and restaurants",
  Transport: "Fuel, public transport, taxis, parking and flights",
  Shopping: "Clothes, electronics, furniture and personal purchases",
  "Leisure & subscriptions": "Streaming, gaming, cinema, music and hobbies",
  Other: "Anything that doesn’t fit elsewhere",
};

export type TransactionItem = {
  id: number;
  brand: string;
  amount_pence: number;
  category: string;
  ethical_score: number | null; // null = not scored yet
  occurred_on: string; // YYYY-MM-DD
};
