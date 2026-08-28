import { Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { TextReveal } from "@/components/motion/TextReveal";
import { RosterHero } from "@/components/motion/RosterHero";
import { SITE } from "@/lib/site";

/*
  2.1 Hero (dark). Short hard display line + subhead, availability badge, CTA
  pair, and the roster animation inside browser chrome with the RosterBay violet
  halo. The animation initializes after first paint, so it never delays LCP.
*/

export function Hero() {
  return (
    <Section
      className="pt-36 sm:pt-44"
      style={{ "--accent": "var(--color-accent-violet)" } as React.CSSProperties}
    >
      <div className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface-2 px-3 py-1.5 font-mono text-meta uppercase text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-accent-lime opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-pill bg-accent-lime" />
          </span>
          Available for projects
        </span>

        <TextReveal
          lines={["Software for teams", "that never sit at a desk."]}
          as="h1"
          className="font-display text-display text-text"
          lineClassName="text-balance"
        />

        <Text size="lg" className="max-w-[62ch]" measure>
          I build rostering, GPS time-tracking, and compliance systems for staffing, cleaning,
          security and care companies, plus the field apps their crews actually use.
        </Text>

        <div className="mt-2 flex flex-wrap gap-3">
          <Magnetic>
            <Button href={SITE.links.rosterbay} external>
              Open the live demo ↗
            </Button>
          </Magnetic>
          <Button href={SITE.links.upwork} external variant="secondary">
            Hire me on Upwork ↗
          </Button>
        </div>
      </div>

      {/* Hero visual — roster animation in browser chrome with violet halo. */}
      <div className="mt-16 frame-halo">
        <div className="device-shadow overflow-hidden rounded-media border border-border bg-surface-1">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="flex gap-2" aria-hidden>
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
            </span>
            <span className="truncate rounded-pill bg-surface-3 px-3 py-1 font-mono text-[11px] text-dim">
              rosterbay.com/app/roster
            </span>
          </div>
          <div className="bg-surface-2 p-4 sm:p-8">
            <RosterHero />
          </div>
        </div>
      </div>
    </Section>
  );
}
