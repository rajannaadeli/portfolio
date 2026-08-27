import type { MetadataRoute } from "next";
import { getAllCases } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
  for (const c of getAllCases()) {
    routes.push({
      url: `${SITE.url}/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  return routes;
}
