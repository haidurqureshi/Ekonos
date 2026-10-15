import type { Category } from "../lib/transaction-types";

export type BrandCategory = Category;

export type BrandSuggestion = {
  name: string;
  category: BrandCategory;
};

// A starter list of common UK brands. Add or remove entries freely.
// Later you can replace searchBrands() with a call to a places/business API
// without touching the page.
const brands: BrandSuggestion[] = [
  // Food and shopping
  { name: "Tesco", category: "Food & drink" },
  { name: "Sainsbury's", category: "Food & drink" },
  { name: "Asda", category: "Food & drink" },
  { name: "Morrisons", category: "Food & drink" },
  { name: "Aldi", category: "Food & drink" },
  { name: "Lidl", category: "Food & drink" },
  { name: "Waitrose", category: "Food & drink" },
  { name: "Co-op", category: "Food & drink" },
  { name: "Iceland", category: "Food & drink" },
  { name: "Marks & Spencer", category: "Shopping" },
  { name: "Amazon", category: "Shopping" },
  { name: "Argos", category: "Shopping" },
  { name: "IKEA", category: "Shopping" },
  { name: "John Lewis", category: "Shopping" },
  { name: "Boots", category: "Shopping" },
  { name: "Superdrug", category: "Shopping" },
  { name: "Primark", category: "Shopping" },
  { name: "H&M", category: "Shopping" },
  { name: "Zara", category: "Shopping" },
  { name: "Next", category: "Shopping" },
  { name: "B&Q", category: "Shopping" },
  { name: "Currys", category: "Shopping" },
  { name: "Apple", category: "Shopping" },

  // Transport
  { name: "Shell", category: "Transport" },
  { name: "BP", category: "Transport" },
  { name: "Esso", category: "Transport" },
  { name: "Texaco", category: "Transport" },
  { name: "TfL", category: "Transport" },
  { name: "Trainline", category: "Transport" },
  { name: "National Rail", category: "Transport" },
  { name: "Uber", category: "Transport" },
  { name: "Bolt", category: "Transport" },
  { name: "National Express", category: "Transport" },
  { name: "Stagecoach", category: "Transport" },
  { name: "Arriva", category: "Transport" },
  { name: "First Bus", category: "Transport" },
  { name: "easyJet", category: "Transport" },
  { name: "Ryanair", category: "Transport" },
  { name: "British Airways", category: "Transport" },

  // Other
  { name: "Greggs", category: "Food & drink" },
  { name: "Costa", category: "Food & drink" },
  { name: "Starbucks", category: "Food & drink" },
  { name: "Pret A Manger", category: "Food & drink" },
  { name: "McDonald's", category: "Food & drink" },
  { name: "KFC", category: "Food & drink" },
  { name: "Nando's", category: "Food & drink" },
  { name: "Netflix", category: "Leisure & subscriptions" },
  { name: "Spotify", category: "Leisure & subscriptions" },
  { name: "Disney+", category: "Leisure & subscriptions" },
  { name: "Octopus Energy", category: "Bills & housing" },
  { name: "British Gas", category: "Bills & housing" },
  { name: "EDF", category: "Bills & housing" },
  { name: "OVO Energy", category: "Bills & housing" },
  { name: "BT", category: "Bills & housing" },
  { name: "Virgin Media", category: "Bills & housing" },
  { name: "Vodafone", category: "Bills & housing" },
  { name: "EE", category: "Bills & housing" },
  { name: "O2", category: "Bills & housing" },
];

// Names that start with the query come first, then names that contain it.
export function searchBrands(query: string, limit = 6): BrandSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const starts: BrandSuggestion[] = [];
  const contains: BrandSuggestion[] = [];

  for (const b of brands) {
    const name = b.name.toLowerCase();
    if (name === q) continue; // already typed in full, nothing to suggest
    if (name.startsWith(q)) starts.push(b);
    else if (name.includes(q)) contains.push(b);
  }

  return [...starts, ...contains].slice(0, limit);
}
