import { Section, Container } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DeviceFrame } from "@/components/ui/device-frame";
import { getCase, getImageByUse } from "@/lib/content";
import { SITE } from "@/lib/site";

/*
  2.3 Featured case — RosterBay (dark, full-bleed, Phase-3 §5). The page's
  centrepiece: the most vertical air of any section, the dark dashboard as a
  whole frame with a gentle parallax drift, and three proof points restyled as
  body-text lines with a small drawn violet chevron — not asterisked markdown.
*/

function Chevron() {
  return (
    <svg
      aria-hidden
      className="mt-1 shrink-0"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M4 2 L9 7 L4 12"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeaturedCase() {
  const c = getCase("rosterbay");
  const hero = getImageByUse("rosterbay", "hero", "dark");
  if (!c) return null;

  return (
    <Section fullBleed air style={{ "--accent": c.accentVar } as React.CSSProperties}>
      <Container>
        <SectionHeader eyebrow="Featured case" lines={[c.name]} variant="display" accentEyebrow />
        <Reveal className="mt-6">
          <Text size="lg" className="max-w-[60ch]">
            {c.lede}
          </Text>

          <ul className="mt-10 flex flex-col gap-5">
            {c.proofChips.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Chevron />
                <span className="font-body text-body text-text">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <Button href={SITE.links.rosterbay} external>
                Open the live demo ↗
              </Button>
            </Magnetic>
            <Button href={`/work/${c.slug}`} variant="secondary">
              Read the {c.name} case →
            </Button>
          </div>
        </Reveal>
      </Container>

      {hero ? (
        <div className="mt-16">
          <Container>
            <DeviceFrame
              image={hero}
              url="rosterbay.com/app"
              priority
              halo
              parallax
              sizes="(min-width: 1320px) 1320px, 100vw"
            />
          </Container>
        </div>
      ) : null}
    </Section>
  );
}
