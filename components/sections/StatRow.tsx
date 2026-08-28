import Link from "next/link";
import { Section } from "@/components/ui/layout";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/lib/site";

/*
  2.2 Stat row (dark) — bento. The "1 live product" card is wider, taller, violet,
  linked; the other three are smaller. Numerals mono at --fs-mega with count-up;
  descriptors in body text (not mono).
*/

const SMALL = [
  { value: 3, suffix: "+", label: "years building software" },
  { value: 8, suffix: "", label: "products shipped to production" },
  { value: 3, suffix: "", label: "countries with clients" },
];

export function StatRow() {
  return (
    <Section>
      <Reveal className="grid grid-cols-2 gap-gutter lg:grid-cols-12" stagger={0.08}>
        {SMALL.map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-border bg-surface-1 p-6 lg:col-span-4"
          >
            <div className="font-mono text-mega leading-[0.9] text-text">
              <CountUp value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-4 font-body text-body text-muted">{s.label}</div>
          </div>
        ))}

        {/* Dominant live-product card */}
        <Link
          href={SITE.links.rosterbay}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex flex-col justify-between rounded-card border border-accent-violet/40 bg-surface-1 p-6 transition-colors hover:border-accent-violet sm:p-8 lg:col-span-12 lg:row-span-1"
        >
          <div className="flex items-start justify-between">
            <div className="font-mono text-mega leading-[0.9] text-accent-violet">
              <CountUp value={1} />
            </div>
            <span
              aria-hidden
              className="mt-2 flex h-10 w-10 items-center justify-center rounded-pill border border-accent-violet/40 font-mono text-body text-accent-violet"
            >
              R
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
            <div className="font-body text-body-lg text-text">
              live product you can open right now
            </div>
            <span className="font-mono text-meta uppercase text-accent-violet transition-transform group-hover:translate-x-1">
              Open RosterBay ↗
            </span>
          </div>
        </Link>
      </Reveal>
    </Section>
  );
}
