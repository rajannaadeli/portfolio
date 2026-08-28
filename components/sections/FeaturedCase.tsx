import { Section, Container } from "@/components/ui/layout";
import { Heading, Text, MetaLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { DeviceFrame } from "@/components/ui/device-frame";
import { getCase, getImageByUse } from "@/lib/content";
import { SITE } from "@/lib/site";

/*
  2.3 Featured case — RosterBay (dark, full-bleed). Display title, two-sentence
  body description, three proof points as body-size lines with an accent marker
  (not mono chips), a large framed screenshot with ≤8% parallax, two actions.
*/

export function FeaturedCase() {
  const c = getCase("rosterbay");
  const hero = getImageByUse("rosterbay", "hero");
  if (!c) return null;

  return (
    <Section
      fullBleed
      style={{ "--accent": c.accentVar } as React.CSSProperties}
    >
      <Container>
        <Reveal>
          <MetaLabel accent>Featured case</MetaLabel>
          <Heading variant="display" as="h2" className="mt-4 max-w-[14ch]">
            {c.name}
          </Heading>
          <Text size="lg" className="mt-6 max-w-[60ch]">
            {c.lede}
          </Text>

          <ul className="mt-8 flex flex-col gap-3">
            {c.proofChips.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-[color:var(--accent)]"
                />
                <span className="font-body text-body-lg text-text">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Button href={SITE.links.rosterbay} external>
                Open the live demo ↗
              </Button>
            </Magnetic>
            <Button href={`/work/${c.slug}`} variant="secondary">
              Read the case →
            </Button>
          </div>
        </Reveal>
      </Container>

      {hero ? (
        <div className="mt-14">
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
