import { getAllCases } from "@/lib/content";
import { SITE } from "@/lib/site";
import { FAQ } from "@/lib/faq";

/*
  /llms.txt — the emerging convention (llmstxt.org) for handing an AI crawler a
  clean, plain-text summary instead of making it reconstruct one from animated
  markup. Increasingly read by ChatGPT Search, Perplexity, and Claude.

  Generated from the same content source as the pages, so it cannot go stale.
  force-static keeps it exportable as a flat file.
*/
export const dynamic = "force-static";

export function GET() {
  const cases = getAllCases();

  const body = `# ${SITE.name}

> ${SITE.positioning}

Full-stack developer based in Pune, India, working with clients in Australia,
the United States, and the United Kingdom. Specialises in workforce and
operations software for deskless teams: rostering, GPS time and attendance,
compliance and certification tracking, multi-tenant SaaS, and the React Native
field apps crews use on shift.

- Site: ${SITE.url}
- Contact: ${SITE.email}
- Upwork: ${SITE.links.upwork}
- LinkedIn: ${SITE.links.linkedin}
- GitHub: ${SITE.links.github}
- Live product demo: ${SITE.links.rosterbay}

## Services

- Rostering — shift scheduling that respects coverage, skills, and the clock.
- GPS time & attendance — clock-ins tied to real locations, with variances flagged.
- Compliance tracking — certifications and documents watched before they expire.
- Multi-tenant SaaS — one platform, many companies, cleanly walled off.
- Field apps — React Native apps the crew actually opens on a shift.
- Realtime dashboards — what is happening on the ground, updating as it happens.

## Work

${cases
  .map(
    (c) => `### ${c.name}${c.deck ? ` — ${c.deck}` : ""}
${c.lede}
- URL: ${SITE.url}/work/${c.slug}
- Category: ${c.category}
- Role: ${c.facts.role}
- Timeline: ${c.facts.timeline}
- Stack: ${c.facts.stack.join(", ")}
- Status: ${c.facts.status}
${c.proofChips.map((p) => `- ${p}`).join("\n")}`,
  )
  .join("\n\n")}

## FAQ

${FAQ.map((f) => `**${f.q}**\n${f.a}`).join("\n\n")}

## Engagement

Fixed-price against milestones. Available for new projects. Start by messaging
on Upwork or emailing ${SITE.email} with a sketch of the problem.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
