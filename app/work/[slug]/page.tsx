import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Container } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/ui/prose";
import { DeviceFrame } from "@/components/ui/device-frame";
import { getCase, getShortlisted, getCaseNeighbors, CASE_ORDER } from "@/lib/content";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return CASE_ORDER.map((slug) => ({ slug }));
}

type CaseParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CaseParams): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  const description = c.lede;
  return {
    title: c.name,
    description,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: {
      type: "article",
      title: `${c.name} — Rajanna Adeli`,
      description,
      url: `${SITE.url}/work/${c.slug}`,
    },
  };
}

export default async function CasePage({ params }: CaseParams) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const shortlisted = getShortlisted(slug);
  const heroImage = shortlisted[0];
  const gallery = shortlisted.slice(1);
  const { prev, next } = getCaseNeighbors(slug);

  return (
    <div style={{ "--accent": c.accentVar } as React.CSSProperties}>
      {/* Header + facts strip */}
      <Section className="pt-40 sm:pt-48">
        <MetaLabel accent>Case · 0{c.order + 1}</MetaLabel>
        <Heading variant="display" as="h1" className="mt-4 max-w-[18ch]">
          {c.title}
        </Heading>
        <Text size="lg" className="mt-6" measure>
          {c.lede}
        </Text>

        {/* Facts strip: role · timeline · stack · status · links */}
        <dl className="mt-10 grid grid-cols-1 gap-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <FactItem label="Role" value={c.facts.role} />
          <FactItem label="Timeline" value={c.facts.timeline} />
          <FactItem label="Status" value={c.facts.status} />
          <div>
            <dt>
              <MetaLabel>Links</MetaLabel>
            </dt>
            <dd className="mt-2 flex flex-col gap-1">
              {c.facts.links.length ? (
                c.facts.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-body text-body text-(--accent) underline underline-offset-4"
                  >
                    {l.label} ↗
                  </a>
                ))
              ) : (
                <span className="font-body text-body text-dim">—</span>
              )}
            </dd>
          </div>
        </dl>

        {/* Stack row */}
        {c.facts.stack.length ? (
          <div className="mt-8">
            <MetaLabel>Stack</MetaLabel>
            <ul className="mt-3 flex flex-wrap gap-2">
              {c.facts.stack.map((tech) => (
                <li key={tech}>
                  <Chip variant="outline">{tech}</Chip>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Proof chips */}
        {c.proofChips.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {c.proofChips.map((chip) => (
              <Chip key={chip} variant="accent">
                {chip}
              </Chip>
            ))}
          </div>
        ) : null}
      </Section>

      {/* Hero image */}
      {heroImage ? (
        <Section fullBleed className="pt-0!">
          <Container>
            <DeviceFrame image={heroImage} priority sizes="(min-width: 1320px) 1320px, 100vw" />
            {heroImage.caption ? (
              <Text className="mt-4 text-center">{heroImage.caption}</Text>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {/* Body */}
      <Section className="pt-0!">
        <Prose html={c.bodyHtml} />
      </Section>

      {/* Shortlisted gallery — placed after the body this phase (per manifest
          order); interleaving at claim points is Phase 3. */}
      {gallery.length ? (
        <Section className="pt-0!">
          <MetaLabel>Screens</MetaLabel>
          <div className="mt-8 flex flex-col gap-16">
            {gallery.map((img) => (
              <figure key={img.file}>
                <DeviceFrame image={img} sizes="(min-width: 1320px) 1100px, 100vw" />
                {img.caption ? (
                  <figcaption className="mt-4">
                    <Text>{img.caption}</Text>
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      {/* In-page CTA (floating persistent CTA is Phase 2) */}
      <Section className="pt-0!">
        <div className="rounded-card border border-border bg-surface-1 p-8 text-center">
          <Heading variant="h3" as="h2">
            Want something like {c.name}?
          </Heading>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={SITE.links.upwork} external>
              Hire me on Upwork
            </Button>
            <Button href={`mailto:${SITE.email}`} variant="secondary">
              Email me
            </Button>
          </div>
        </div>
      </Section>

      {/* Prev / next */}
      <Section className="pt-0!">
        <nav className="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
          <Link href={`/work/${prev.slug}`} className="group">
            <MetaLabel>← Previous</MetaLabel>
            <div className="mt-2 font-display text-h3 text-muted transition-colors group-hover:text-text">
              {prev.name}
            </div>
          </Link>
          <Link href={`/work/${next.slug}`} className="group text-right">
            <MetaLabel>Next →</MetaLabel>
            <div className="mt-2 font-display text-h3 text-muted transition-colors group-hover:text-text">
              {next.name}
            </div>
          </Link>
        </nav>
      </Section>
    </div>
  );
}

function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>
        <MetaLabel>{label}</MetaLabel>
      </dt>
      <dd className="mt-2 font-body text-body text-text">{value || "—"}</dd>
    </div>
  );
}
