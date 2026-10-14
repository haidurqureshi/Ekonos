export type BrandCategory = "Transport" | "Shopping" | "Other";

export type BrandSuggestion = {
  name: string;
  category: BrandCategory;
};

// A starter list of common UK brands. Add or remove entries freely.
// Later you can replace searchBrands() with a call to a places/business API
// without touching the page.
const brands: BrandSuggestion[] = [
  // Shopping (supermarkets, retail)
  { name: "Tesco", category: "Shopping" },
  { name: "Sainsbury's", category: "Shopping" },
  { name: "Asda", category: "Shopping" },
  { name: "Morrisons", category: "Shopping" },
  { name: "Aldi", category: "Shopping" },
  { name: "Lidl", category: "Shopping" },
  { name: "Waitrose", category: "Shopping" },
  { name: "Co-op", category: "Shopping" },
  { name: "Iceland", category: "Shopping" },
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

  // Other (food and drink out, bills, subscriptions)
  { name: "Greggs", category: "Other" },
  { name: "Costa", category: "Other" },
  { name: "Starbucks", category: "Other" },
  { name: "Pret A Manger", category: "Other" },
  { name: "McDonald's", category: "Other" },
  { name: "KFC", category: "Other" },
  { name: "Nando's", category: "Other" },
  { name: "Netflix", category: "Other" },
  { name: "Spotify", category: "Other" },
  { name: "Disney+", category: "Other" },
  { name: "Octopus Energy", category: "Other" },
  { name: "British Gas", category: "Other" },
  { name: "EDF", category: "Other" },
  { name: "OVO Energy", category: "Other" },
  { name: "BT", category: "Other" },
  { name: "Virgin Media", category: "Other" },
  { name: "Vodafone", category: "Other" },
  { name: "EE", category: "Other" },
  { name: "O2", category: "Other" },
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
