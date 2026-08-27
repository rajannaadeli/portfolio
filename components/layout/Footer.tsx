import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { MetaLabel } from "@/components/ui/typography";
import { SITE } from "@/lib/site";

/*
  Footer — email + real links from the master brief (§7). No placeholders.
  The "Built with Next.js — Lighthouse 100" line ships only if the score is
  genuinely 100 at launch (Phase 3 decision), so it is omitted here.
*/

const LINKS = [
  { label: "Email", href: `mailto:${SITE.email}`, external: false },
  { label: "Upwork", href: SITE.links.upwork, external: true },
  { label: "LinkedIn", href: SITE.links.linkedin, external: true },
  { label: "GitHub", href: SITE.links.github, external: true },
  { label: "Résumé (PDF)", href: SITE.links.resume, external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-h3 text-text">Rajanna Adeli</div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-2 inline-block font-mono text-meta uppercase text-[color:var(--color-accent-orange)]"
            >
              {SITE.email}
            </a>
            <p className="mt-3 max-w-sm font-body text-body text-muted">{SITE.location}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            {LINKS.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-meta uppercase text-muted transition-colors hover:text-text"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="font-mono text-meta uppercase text-muted transition-colors hover:text-text"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <MetaLabel>© {new Date().getFullYear()} Rajanna Adeli</MetaLabel>
          <MetaLabel>Built with Next.js</MetaLabel>
        </div>
      </Container>
    </footer>
  );
}
