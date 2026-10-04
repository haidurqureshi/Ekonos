import type { MetadataRoute } from "next";

const siteUrl = "https://ekonos.co.uk";

// Only public marketing pages. Login, signup and dashboard pages are left out on purpose.
const routes = [
  { path: "", priority: 1 },
  { path: "/guides/ethical-budgeting", priority: 0.8 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-of-service", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
  }));
}
