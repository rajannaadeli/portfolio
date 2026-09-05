import { Section, Container, Grid } from "@/components/ui/layout";
import { Heading, MetaLabel } from "@/components/ui/typography";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { SITE } from "@/lib/site";

/*
  2.10 Contact (dark, full-bleed). Oversized invitation, the form, and direct
  links beside it.
*/

const LINKS = [
  { label: "Upwork", href: SITE.links.upwork },
  { label: "LinkedIn", href: SITE.links.linkedin },
  { label: "GitHub", href: SITE.links.github },
];

export function Contact() {
  return (
    <Section fullBleed id="contact">
      <Container>
        <Reveal>
          <Heading variant="display" as="h2" className="w-full">
            Tell me what your team is drowning in.
          </Heading>

          <Grid className="mt-14" cols="grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5">
              <MetaLabel>Direct</MetaLabel>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-4 block font-mono text-body-lg text-accent-orange"
              >
                {SITE.email}
              </a>
              <ul className="mt-6 flex flex-col gap-3">
                {LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-mono text-meta uppercase text-muted transition-colors hover:text-text"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-7">
              <ContactForm />
            </div>
          </Grid>
        </Reveal>
      </Container>
    </Section>
  );
}
