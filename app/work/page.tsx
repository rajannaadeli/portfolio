import type { Metadata } from "next";
import { Section } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { WorkBento, type Tile } from "@/components/sections/WorkBento";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllCases, getShortlisted, getImageByUse } from "@/lib/content";
import { SITE } from "@/lib/site";
import { ID, breadcrumbEntity, caseSeo, graph } from "@/lib/seo";

const WORK_TITLE = "Work — Workforce & Operations Systems";
const WORK_DESCRIPTION =
  "Six production systems, built end to end: a live rostering and GPS time-tracking platform, two Australian workforce platforms, document control, and a retail POS.";

export const metadata: Metadata = {
  // Kept to ~52 characters with the name, so nothing truncates in results.
  title: { absolute: `${WORK_TITLE} — Rajanna Adeli` },
  description: WORK_DESCRIPTION,
  keywords: [
    "workforce software case studies",
    "rostering software portfolio",
    "multi-tenant SaaS case study",
    "React Native field app portfolio",
    "freelance developer work samples",
  ],
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    url: `${SITE.url}/work`,
    title: WORK_TITLE,
    description: WORK_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: WORK_TITLE, description: WORK_DESCRIPTION },
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

  /*
    CollectionPage + ItemList tells Google these six URLs are one set, which is
    what makes them eligible to appear as sitelinks under the site's own result.
    The breadcrumb gives every case page a labelled path back to the index.
  */
  const jsonLd = graph(
    {
      "@type": "CollectionPage",
      "@id": `${SITE.url}/work#webpage`,
      url: `${SITE.url}/work`,
      name: WORK_TITLE,
      description: WORK_DESCRIPTION,
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.person },
      inLanguage: "en",
    },
    breadcrumbEntity([
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ]),
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: tiles.length,
      itemListElement: tiles.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE.url}/work/${t.slug}`,
        name: t.name,
        description: t.lede,
        image: `${SITE.url}${t.thumb.webp}`,
        additionalType: caseSeo(t.slug).schema,
      })),
    },
  );

  return (
    <Section className="pt-40 sm:pt-48">
      <JsonLd data={jsonLd} />
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
