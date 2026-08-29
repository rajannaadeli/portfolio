import { Section } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/typography";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

/*
  2.6 How I work (light) — three engagement cards (no pricing) and the four
  working-style claims as body text (15–16px) with an accent check glyph, 2×2.
*/

const ENGAGEMENT = [
  { title: "Fixed-price project", body: "Scoped into milestones, so the cost is known before we start." },
  { title: "Ongoing retainer", body: "Continued building and maintenance after launch." },
  { title: "Paid discovery", body: "A focused session to map the problem before committing to a build." },
];

const CLAIMS = [
  "Fixed-price, so the cost is known upfront.",
  "AI-accelerated delivery with guardrails: typed code, tests on core logic, review discipline.",
  "AEST and US-morning overlap.",
  "Written communication. No surprises.",
];

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="10" stroke="#c23a15" strokeWidth="1.5" />
      <path d="M8 12.5l2.5 2.5 5-5.5" stroke="#c23a15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HowIWork() {
  return (
    <Section id="how-i-work">
      <SectionHeader eyebrow="How I work" lines={["Clear terms, no games."]} />

      <Reveal className="mt-12 grid grid-cols-1 gap-gutter md:grid-cols-3">
        {ENGAGEMENT.map((e) => (
          <div key={e.title} className="rounded-card border border-border bg-surface-1 p-6 transition-colors hover:border-border-hover">
            <Heading variant="h3" as="h3">
              {e.title}
            </Heading>
            <Text className="mt-3">{e.body}</Text>
          </div>
        ))}
      </Reveal>

      <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
        {CLAIMS.map((claim) => (
          <li key={claim} className="flex items-start gap-3">
            <Check />
            <span className="font-body text-body text-text">{claim}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
