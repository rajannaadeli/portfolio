import { statSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { getAllCases } from "@/lib/content";
import { SITE } from "@/lib/site";

// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

/*
  Sitemap. `lastModified` comes from the case markdown's mtime rather than
  `new Date()` — a sitemap that claims every page changed on every build teaches
  Google to ignore the field entirely.

  Each case entry also carries its shortlisted screenshots, which is how those
  images become eligible for Google Images. They are already the site's strongest
  differentiator; there is no reason to keep them out of the index.
*/

function fileModified(slug: string): Date {
  try {
    return statSync(join(process.cwd(), "cases", slug, `${slug}.md`)).mtime;
  } catch {
    return new Date();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const cases = getAllCases();
  // The home page reflects whatever changed most recently anywhere in the site.
  const newest = cases
    .map((c) => fileModified(c.slug))
    .reduce((a, b) => (a > b ? a : b), new Date(0));

  return [
    { url: SITE.url, lastModified: newest, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/work`, lastModified: newest, changeFrequency: "monthly", priority: 0.9 },
    ...cases.map((c) => ({
      url: `${SITE.url}/work/${c.slug}`,
      lastModified: fileModified(c.slug),
      changeFrequency: "yearly" as const,
      priority: c.slug === "rosterbay" ? 0.9 : 0.8,
      images: c.images
        .filter((i) => i.shortlisted)
        .slice(0, 8)
        .map((i) => `${SITE.url}${i.webp}`),
    })),
  ];
}
