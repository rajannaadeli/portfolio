import type { Metadata } from "next";
import { Section } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { WorkBento, type Tile } from "@/components/sections/WorkBento";
import { getAllCases, getShortlisted, getImageByUse } from "@/lib/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description: "Six production systems: rostering, workforce, document control, scheduling, and retail POS.",
  alternates: { canonical: "/work" },
};

const CFG: Record<string, { span: string; ratio: string; portrait: boolean }> = {
  rosterbay: { span: "lg:col-span-8", ratio: "16 / 10", portrait: false },
  whitefleet: { span: "lg:col-span-4", ratio: "3 / 4", portrait: true },
  gad: { span: "lg:col-span-6", ratio: "16 / 10", portrait: false },
  docfort: { span: "lg:col-span-6", ratio: "16 / 10", portrait: false },
  planit: { span: "lg:col-span-5", ratio: "3 / 4", portrait: true },
  dilpos: { span: "lg:col-span-7", ratio: "16 / 10", portrait: false },
};

function metaRow(timeline: string, role: string, stack: string[]): string {
  const year = (timeline.match(/20\d\d/) ?? [""])[0];
  const r = /1 of 3|of 3/i.test(role)
    ? "Team (1 of 3)"
    : /sole|solo/i.test(role)
      ? "Solo build"
      : "Full-stack";
  const s = stack.slice(0, 2).join(" + ");
  return [year, r, s].filter(Boolean).join(" · ").toUpperCase();
}

export default function WorkIndexPage() {
  const tiles: Tile[] = getAllCases().map((c) => {
    const cfg = CFG[c.slug] ?? { span: "lg:col-span-6", ratio: "16 / 10", portrait: false };
    const isDarkUI = c.darkImages.length > 0;
    const theme = isDarkUI ? "dark" : "light";
    const shortlisted = getShortlisted(c.slug, theme);
    const hero = getImageByUse(c.slug, "hero", theme);
    const img =
      shortlisted.find((i) => (cfg.portrait ? i.height > i.width : i.width > i.height)) ??
      hero ??
      shortlisted[0];
    return {
      slug: c.slug,
      name: c.name,
      lede: c.lede,
      category: c.category,
      accentVar: c.accentVar,
      accentTextVar: c.accentTextVar,
      order: c.order,
      meta: metaRow(c.facts.timeline, c.facts.role, c.facts.stack),
      live: c.slug === "rosterbay" ? SITE.links.rosterbay : undefined,
      paper: !isDarkUI,
      span: cfg.span,
      ratio: cfg.ratio,
      thumb: {
        avif: img.avif,
        webp: img.webp,
        width: img.width,
        height: img.height,
        alt: img.alt,
        blur: img.blurDataURL,
      },
    };
  });

  return (
    <Section className="pt-40 sm:pt-48">
      <MetaLabel>Work</MetaLabel>
      <Heading variant="display" as="h1" className="mt-4 max-w-[14ch]">
        Six systems, shipped.
      </Heading>
      <Text size="lg" className="mt-6" measure>
        Rostering, workforce platforms, document control, scheduling, and point of sale. Each one a
        production build, described precisely.
      </Text>

      <WorkBento tiles={tiles} />
    </Section>
  );
}
