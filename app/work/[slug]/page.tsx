import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Container } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { DeviceFrame } from "@/components/ui/device-frame";
import { CaseRail } from "@/components/sections/CaseRail";
import { RevealHeadings } from "@/components/sections/RevealHeadings";
import {
  getCase,
  getShortlisted,
  getImageByUse,
  getCaseNeighbors,
  CASE_ORDER,
  type CaseImage,
  type CaseStudy,
} from "@/lib/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { ID, breadcrumbEntity, caseEntity, caseSeo, caseTitle, graph } from "@/lib/seo";

export function generateStaticParams() {
  return CASE_ORDER.map((slug) => ({ slug }));
}

type CaseParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CaseParams): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  const seo = caseSeo(slug);
  // Deliberately absolute — it skips the "%s — Rajanna Adeli" template. The case
  // name plus its descriptor already fills the ~60 characters a result shows,
  // and Google renders the site name separately from og:site_name anyway.
  const title = caseTitle(c.name, c.deck, c.slug);
  return {
    title: { absolute: title },
    description: c.lede,
    keywords: [...seo.keywords, ...c.facts.stack, c.name],
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: {
      type: "article",
      title,
      description: c.lede,
      url: `${SITE.url}/work/${c.slug}`,
      publishedTime: seo.published,
      modifiedTime: seo.modified,
      authors: [SITE.url],
      tags: seo.keywords,
    },
    twitter: { card: "summary_large_image", title, description: c.lede },
  };
}

function liveLink(c: CaseStudy) {
  return c.facts.links.find((l) => !/repo|github/i.test(l.label + l.url));
}

// A framed screenshot with figure index + caption; light-UI shots can sit on a
// paper panel when placed on a dark band (C.2/B.3).
function Figure({
  image,
  index,
  paper = false,
  inset = false,
  priority = false,
}: {
  image: CaseImage;
  index: number;
  paper?: boolean;
  inset?: boolean;
  priority?: boolean;
}) {
  const frame = (
    <DeviceFrame image={image} priority={priority} sizes="(min-width: 1024px) 60vw, 100vw" />
  );
  return (
    <figure className={inset ? "mx-auto w-full max-w-[80%]" : "w-full"}>
      {paper ? (
        <div className="rounded-media bg-[#f7f6f3] p-4 shadow-[0_24px_60px_rgba(16,16,20,0.35)] sm:p-6">
          {frame}
        </div>
      ) : (
        frame
      )}
      {image.caption ? (
        <figcaption className="mt-4 flex gap-3">
          <span className="shrink-0 font-mono text-meta uppercase text-dim">
            Fig {String(index).padStart(2, "0")}
          </span>
          <span className="font-body text-body text-muted">{image.caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

function PrevNextCard({ c, dir }: { c: CaseStudy; dir: "prev" | "next" }) {
  const thumb = c.images.find((i) => i.shortlisted) ?? c.images[0];
  return (
    <Link
      href={`/work/${c.slug}`}
      className="group flex flex-col gap-4 rounded-card border border-border bg-surface-1 p-6 transition-colors hover:border-border-hover sm:p-8"
      style={{ "--accent": c.accentVar } as React.CSSProperties}
    >
      <MetaLabel accent>{dir === "prev" ? "← Previous" : "Next →"}</MetaLabel>
      <div className={dir === "next" ? "text-right" : ""}>
        <div className="font-display text-h3 text-text transition-colors group-hover:text-(--accent-text)">
          {c.name}
        </div>
        <p className="mt-2 font-body text-body text-muted">{c.lede}</p>
      </div>
      {thumb ? (
        <div className="mt-2 overflow-hidden rounded-media border border-border">
          <DeviceFrame image={thumb} sizes="(min-width: 640px) 40vw, 100vw" />
        </div>
      ) : null}
    </Link>
  );
}

export default async function CasePage({ params }: CaseParams) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const isDarkUI = c.darkImages.length > 0; // RosterBay ships dark-theme screens
  const theme = isDarkUI ? "dark" : "light";
  const shortlisted = getShortlisted(slug, theme);
  const heroImage = getImageByUse(slug, "hero", theme) ?? shortlisted[0];
  const inlineImgs = shortlisted.filter((i) => i.file !== heroImage?.file);
  const { prev, next } = getCaseNeighbors(slug);

  // Split the rendered body at each <h2> so images can be placed between
  // sections (C.5 — manifests lack placement/proves, so this is a structural
  // interleave; see report).
  const parts = c.bodyHtml.split(/(?=<h2 )/);
  const intro = parts[0]?.startsWith("<h2") ? "" : parts.shift() ?? "";
  const placed = Math.min(inlineImgs.length, parts.length);
  const gallery = inlineImgs.slice(placed);

  const action = liveLink(c)
    ? { label: "Open the demo ↗", href: liveLink(c)!.url, external: true }
    : { label: "Hire me ↗", href: SITE.links.upwork, external: true };

  /*
    The project entity (SoftwareApplication for anything runnable) plus the
    Article that describes it, joined by `about`/`mainEntity` so a crawler reads
    them as one thing rather than two competing pages. Breadcrumb completes the
    Home → Work → Case path.
  */
  const seo = caseSeo(slug);
  const jsonLd = graph(
    caseEntity(c),
    {
      "@type": "Article",
      "@id": `${SITE.url}/work/${c.slug}#article`,
      headline: caseTitle(c.name, c.deck, c.slug),
      description: c.lede,
      url: `${SITE.url}/work/${c.slug}`,
      datePublished: seo.published,
      dateModified: seo.modified,
      author: { "@id": ID.person },
      publisher: { "@id": ID.person },
      isPartOf: { "@id": ID.website },
      about: { "@id": `${SITE.url}/work/${c.slug}/#project` },
      mainEntity: { "@id": `${SITE.url}/work/${c.slug}/#project` },
      inLanguage: "en",
      ...(heroImage ? { image: `${SITE.url}${heroImage.webp}` } : {}),
      articleSection: c.category,
    },
    breadcrumbEntity([
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
      { name: c.name, path: `/work/${c.slug}` },
    ]),
  );

  return (
    <div style={{ "--accent": c.accentVar } as React.CSSProperties}>
      <JsonLd data={jsonLd} />
      {/* ── HERO (dark) ─────────────────────────────────────────────── */}
      <div data-band="dark">
        <Section className="pt-40 sm:pt-44">
          <MetaLabel accent>
            Case {String(c.order + 1).padStart(2, "0")} / {c.category}
          </MetaLabel>
          <Heading variant="display" as="h1" className="mt-4">
            {c.name}
          </Heading>
          {c.deck ? (
            <p className="mt-4 max-w-[26ch] font-display text-h3 text-muted">{c.deck}</p>
          ) : null}
          <Text size="lg" className="mt-6" measure>
            {c.lede}
          </Text>

          {/* facts as hairline chips (the A.1 fix) */}
          <ul className="mt-8 flex flex-wrap gap-2">
            {[
              c.facts.role && { k: "Role", v: c.facts.role },
              c.facts.timeline && { k: "Timeline", v: c.facts.timeline },
              c.facts.status && { k: "Status", v: c.facts.status },
            ]
              .filter(Boolean)
              .map((f) => {
                const fact = f as { k: string; v: string };
                return (
                  <li
                    key={fact.k}
                    className="rounded-pill border border-border px-3.5 py-1.5 font-mono text-meta uppercase text-muted"
                  >
                    <span className="text-dim">{fact.k}</span> {fact.v}
                  </li>
                );
              })}
            {c.facts.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-block rounded-pill border border-(--accent)/40 px-3.5 py-1.5 font-mono text-meta uppercase text-(--accent) transition-colors hover:border-(--accent)"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>

          {/* proof points as body text with drawn accent markers */}
          {c.proofChips.length ? (
            <ul className="mt-8 flex flex-col gap-3">
              {c.proofChips.slice(0, 3).map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <svg aria-hidden className="mt-1 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 2 L9 7 L4 12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-body text-body-lg text-text">{p}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={action.href} external={action.external}>
              {action.label}
            </Button>
          </div>
        </Section>

        {heroImage ? (
          <Container>
            <div className="pb-[clamp(64px,10vh,140px)]">
              <Figure image={heroImage} index={1} paper={!isDarkUI} priority />
            </div>
          </Container>
        ) : null}
      </div>

      {/* ── BODY (light for banded cases, dark for RosterBay) ─────────── */}
      <div
        data-band={isDarkUI ? "dark" : "light"}
        className={isDarkUI ? "" : "band-light band-edge"}
        style={{ "--accent-text": isDarkUI ? c.accentVar : c.accentTextVar } as React.CSSProperties}
      >
        <Section>
          <Container>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <aside className="hidden lg:col-span-3 lg:block">
                <CaseRail name={c.name} facts={c.facts} sections={c.sections} action={action} />
              </aside>

              <div id="case-body" className="lg:col-span-8 lg:col-start-5">
                <RevealHeadings targetId="case-body" />
                {intro ? <Prose variant="case" html={intro} /> : null}
                {parts.map((part, i) => {
                  const img = inlineImgs[i];
                  return (
                    <div key={i}>
                      <Prose variant="case" html={part} className={intro || i ? "mt-4" : ""} />
                      {img ? (
                        <div className="my-14">
                          <Figure image={img} index={i + 2} inset={i % 2 === 1} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </Section>
      </div>

      {/* ── CLOSING (dark) ──────────────────────────────────────────── */}
      <div data-band="dark" className="band-edge">
        {gallery.length ? (
          <Section>
            <MetaLabel>More screens</MetaLabel>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {gallery.map((img, i) => (
                <Figure key={img.file} image={img} index={placed + i + 2} />
              ))}
            </div>
          </Section>
        ) : null}

        <Section className={gallery.length ? "pt-0!" : ""}>
          <div className="rounded-card border border-border bg-surface-1 p-10 text-center">
            <Heading variant="h2" as="h2" className="mx-auto max-w-[18ch]">
              Want something like {c.name}?
            </Heading>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href={action.href} external={action.external}>
                {action.label}
              </Button>
              <Button href={SITE.links.upwork} external variant="secondary">
                Hire me on Upwork
              </Button>
            </div>
          </div>
        </Section>

        <Section className="pt-0!">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PrevNextCard c={prev} dir="prev" />
            <PrevNextCard c={next} dir="next" />
          </div>
        </Section>
      </div>
    </div>
  );
}
