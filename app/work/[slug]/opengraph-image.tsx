import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";
import { getCase, CASE_ORDER } from "@/lib/content";

/*
  One OG card per case, generated at build. This is the thing that makes a
  proposal link unfurl with the case name and accent instead of a generic site
  card, so it is worth the six extra build-time renders.
*/
export function generateStaticParams() {
  return CASE_ORDER.map((slug) => ({ slug }));
}

// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// A per-case `alt` would need generateImageMetadata, which introduces a
// [__metadata_id__] route segment that `output: "export"` cannot resolve. The
// static alt below costs almost nothing — only screen readers on social
// platforms ever read it — and keeps the export working.
export const alt = "Case study screenshot card — Rajanna Adeli";

/*
  The facts line in the markdown is prose ("Solo — data model, design system,
  web + mobile, ops"), which wraps to three rows on a 1200x630 card and crowds
  the footer. Keep only the part before the first dash/parenthesis, and reduce a
  timeline to its year span.
*/
function shortRole(role: string): string {
  return role.split(/\s+[—–-]\s+|\s*\(/)[0].trim();
}

function shortTimeline(timeline: string): string {
  const years = timeline.match(/20\d\d/g);
  if (!years) return timeline.slice(0, 22);
  const span = [...new Set(years)];
  return span.length > 1 ? `${span[0]}\u2013${span[span.length - 1]}` : span[0];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) {
    return renderOgCard({ eyebrow: "Work", title: "Case study", subtitle: "rajanna.dev" });
  }
  return renderOgCard({
    eyebrow: `Case ${String(c.order + 1).padStart(2, "0")} / ${c.category}`,
    title: c.name,
    subtitle: c.deck || c.lede,
    facts: [
      shortRole(c.facts.role),
      shortTimeline(c.facts.timeline),
      ...c.facts.stack.slice(0, 2),
    ].filter(Boolean),
    accent: c.accent,
  });
}
