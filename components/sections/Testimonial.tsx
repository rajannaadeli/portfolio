import { Section, Container } from "@/components/ui/layout";
import { Reveal } from "@/components/motion/Reveal";

/*
  2.7 Testimonial (dark, full-bleed). A pull-quote shaped by a ~24ch line max,
  a large decorative quote mark behind top-left, mono attribution beneath. Not
  labelled "Testimonials".
*/

export function Testimonial() {
  return (
    <Section fullBleed>
      <Container>
        <Reveal>
          <figure className="relative mx-auto max-w-4xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 -top-16 select-none font-display text-[220px] leading-none text-text opacity-[0.08]"
            >
              &ldquo;
            </span>
            <blockquote className="relative font-display text-h2 text-text [text-wrap:balance]">
              Working with him was a great experience. He handled both the front-end and back-end of
              our project really well and quickly got familiar with our tech stack. His code was
              clean and well-structured, and he was easy to communicate with throughout the project.
              He was reliable, met deadlines, and understood what we needed without much back and
              forth. I&rsquo;d happily work with him again.
            </blockquote>
            <figcaption className="mt-8 font-mono text-meta uppercase text-dim">
              Client · OMAC engagement <span className="text-dim">[TBD — country label]</span>
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </Section>
  );
}
