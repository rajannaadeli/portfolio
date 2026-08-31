import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

/*
  Robots.

  AI crawlers (GPTBot, ClaudeBot, PerplexityBot, and friends) are deliberately
  allowed. For a portfolio the goal is reach: being quotable inside an AI answer
  about workforce software developers is worth more than the content is worth
  protecting. Nothing here is proprietary.

  `/api/` is disallowed — the contact endpoint has no crawlable content and
  should never appear in an index.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      // Named explicitly so a future blanket rule cannot accidentally exclude
      // the crawlers that feed AI search.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Applebot-Extended", "Google-Extended"],
        allow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
